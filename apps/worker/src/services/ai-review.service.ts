import { createLogger } from '@mesrai/config';
import { GitHubAppService } from './github-app.service';

const logger = createLogger({ service: 'ai-review' });

interface CodeAnalysisResult {
  type: 'suggestion' | 'issue' | 'security' | 'performance';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  filePath?: string;
  lineNumber?: number;
  suggestion?: string;
  isCommittable?: boolean;
}

interface PullRequestDiff {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export class AIReviewService {
  private githubAppService: GitHubAppService;

  constructor() {
    this.githubAppService = new GitHubAppService();
  }

  /**
   * Analyze a pull request and generate review comments
   */
  async analyzePullRequest(
    installationId: number,
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<CodeAnalysisResult[]> {
    try {
      logger.info('Starting AI analysis for pull request', {
        installationId,
        owner,
        repo,
        pullNumber
      });

      // Get PR details and files
      const octokit = await this.githubAppService.getInstallationOctokit(installationId);
      
      const [prDetails, prFiles] = await Promise.all([
        octokit.rest.pulls.get({
          owner,
          repo,
          pull_number: pullNumber
        }),
        octokit.rest.pulls.listFiles({
          owner,
          repo,
          pull_number: pullNumber
        })
      ]);

      logger.debug('Retrieved PR details and files', {
        title: prDetails.data.title,
        filesCount: prFiles.data.length,
        additions: prDetails.data.additions,
        deletions: prDetails.data.deletions
      });

      // Analyze each changed file
      const analysisResults: CodeAnalysisResult[] = [];
      
      for (const file of prFiles.data) {
        const fileAnalysis = await this.analyzeFile(file);
        analysisResults.push(...fileAnalysis);
      }

      // Add PR-level analysis
      const prLevelAnalysis = await this.analyzePullRequestLevel(prDetails.data, prFiles.data);
      analysisResults.push(...prLevelAnalysis);

      logger.info('AI analysis completed', {
        installationId,
        owner,
        repo,
        pullNumber,
        totalFindings: analysisResults.length,
        criticalIssues: analysisResults.filter(r => r.severity === 'critical').length,
        securityIssues: analysisResults.filter(r => r.type === 'security').length
      });

      return analysisResults;
    } catch (error) {
      logger.error('Failed to analyze pull request', {
        installationId,
        owner,
        repo,
        pullNumber,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Analyze individual file changes
   */
  private async analyzeFile(file: any): Promise<CodeAnalysisResult[]> {
    const results: CodeAnalysisResult[] = [];
    const { filename, patch, status, additions, deletions } = file;

    if (!patch) {
      return results;
    }

    logger.debug('Analyzing file', { filename, status, additions, deletions });

    // Static analysis rules
    const analysisRules = [
      this.checkSecurityIssues.bind(this),
      this.checkPerformanceIssues.bind(this),
      this.checkCodeQuality.bind(this),
      this.checkBestPractices.bind(this)
    ];

    for (const rule of analysisRules) {
      try {
        const ruleResults = await rule(filename, patch);
        results.push(...ruleResults);
      } catch (error) {
        logger.warn('Analysis rule failed', {
          filename,
          rule: rule.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Check for security vulnerabilities
   */
  private async checkSecurityIssues(filename: string, patch: string): Promise<CodeAnalysisResult[]> {
    const results: CodeAnalysisResult[] = [];
    const lines = patch.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = this.extractLineNumber(line, i);

      // Check for common security issues
      if (line.includes('+ ') && lineNumber) {
        // SQL injection patterns
        if (/\$\{.*\}/.test(line) && /sql|query|select|insert|update|delete/i.test(line)) {
          results.push({
            type: 'security',
            severity: 'critical',
            title: 'Potential SQL Injection Vulnerability',
            description: 'String interpolation in SQL queries can lead to SQL injection. Use parameterized queries instead.',
            filePath: filename,
            lineNumber,
            suggestion: 'Use parameterized queries or prepared statements to prevent SQL injection.',
            isCommittable: false
          });
        }

        // Hardcoded secrets
        if (/password|secret|key|token|api_key/i.test(line) && /['"`][\w\-]{8,}['"`]/.test(line)) {
          results.push({
            type: 'security',
            severity: 'critical',
            title: 'Hardcoded Secret Detected',
            description: 'Hardcoded secrets in source code pose a security risk.',
            filePath: filename,
            lineNumber,
            suggestion: 'Move secrets to environment variables or a secure configuration service.',
            isCommittable: false
          });
        }

        // Eval usage
        if (/eval\(|exec\(|Function\(/i.test(line)) {
          results.push({
            type: 'security',
            severity: 'error',
            title: 'Dangerous Function Usage',
            description: 'Usage of eval() or similar functions can lead to code injection vulnerabilities.',
            filePath: filename,
            lineNumber,
            suggestion: 'Avoid using eval(), exec(), or Function() constructors. Use safer alternatives.',
            isCommittable: false
          });
        }
      }
    }

    return results;
  }

  /**
   * Check for performance issues
   */
  private async checkPerformanceIssues(filename: string, patch: string): Promise<CodeAnalysisResult[]> {
    const results: CodeAnalysisResult[] = [];
    const lines = patch.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = this.extractLineNumber(line, i);

      if (line.includes('+ ') && lineNumber) {
        // N+1 query pattern
        if (/for.*in.*:/.test(line) && lines[i + 1]?.includes('query') || lines[i + 1]?.includes('fetch')) {
          results.push({
            type: 'performance',
            severity: 'warning',
            title: 'Potential N+1 Query Pattern',
            description: 'This loop might cause multiple database queries. Consider using batch operations.',
            filePath: filename,
            lineNumber,
            suggestion: 'Use batch queries, joins, or eager loading to reduce database roundtrips.',
            isCommittable: false
          });
        }

        // Inefficient loops
        if (/for.*in.*array.*length/i.test(line)) {
          results.push({
            type: 'performance',
            severity: 'info',
            title: 'Inefficient Array Iteration',
            description: 'Consider using built-in array methods for better performance and readability.',
            filePath: filename,
            lineNumber,
            suggestion: 'Use array methods like map(), filter(), reduce() instead of manual loops where appropriate.',
            isCommittable: true
          });
        }

        // Memory leaks (event listeners)
        if (/addEventListener/.test(line) && !patch.includes('removeEventListener')) {
          results.push({
            type: 'performance',
            severity: 'warning',
            title: 'Potential Memory Leak',
            description: 'Event listeners without corresponding removal can cause memory leaks.',
            filePath: filename,
            lineNumber,
            suggestion: 'Ensure event listeners are removed when no longer needed.',
            isCommittable: false
          });
        }
      }
    }

    return results;
  }

  /**
   * Check code quality issues
   */
  private async checkCodeQuality(filename: string, patch: string): Promise<CodeAnalysisResult[]> {
    const results: CodeAnalysisResult[] = [];
    const lines = patch.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = this.extractLineNumber(line, i);

      if (line.includes('+ ') && lineNumber) {
        // Large functions (simplified heuristic)
        if (/function|const.*=.*\(|class.*\{/.test(line)) {
          const functionLines = this.countFunctionLines(lines, i);
          if (functionLines > 50) {
            results.push({
              type: 'suggestion',
              severity: 'warning',
              title: 'Large Function Detected',
              description: 'This function appears to be quite large. Consider breaking it into smaller functions.',
              filePath: filename,
              lineNumber,
              suggestion: 'Extract logical sections into separate functions for better readability and maintainability.',
              isCommittable: false
            });
          }
        }

        // Magic numbers
        if (/\s\d{2,}\s/.test(line) && !/const|final|readonly/.test(line)) {
          results.push({
            type: 'suggestion',
            severity: 'info',
            title: 'Magic Number Detected',
            description: 'Consider extracting magic numbers into named constants.',
            filePath: filename,
            lineNumber,
            suggestion: 'Define this number as a named constant to improve code readability.',
            isCommittable: true
          });
        }

        // Console.log statements
        if (/console\.log|print\(|println\(/.test(line)) {
          results.push({
            type: 'suggestion',
            severity: 'info',
            title: 'Debug Statement Found',
            description: 'Debug statements should be removed before production.',
            filePath: filename,
            lineNumber,
            suggestion: 'Remove debug statements or replace with proper logging.',
            isCommittable: true
          });
        }
      }
    }

    return results;
  }

  /**
   * Check best practices
   */
  private async checkBestPractices(filename: string, patch: string): Promise<CodeAnalysisResult[]> {
    const results: CodeAnalysisResult[] = [];
    const lines = patch.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = this.extractLineNumber(line, i);

      if (line.includes('+ ') && lineNumber) {
        // Missing error handling
        if (/await.*\(|\.then\(|fetch\(/.test(line) && !patch.includes('catch') && !patch.includes('try')) {
          results.push({
            type: 'suggestion',
            severity: 'warning',
            title: 'Missing Error Handling',
            description: 'Async operations should include proper error handling.',
            filePath: filename,
            lineNumber,
            suggestion: 'Add try-catch blocks or .catch() handlers for async operations.',
            isCommittable: false
          });
        }

        // TODO comments
        if (/TODO|FIXME|HACK/i.test(line)) {
          results.push({
            type: 'suggestion',
            severity: 'info',
            title: 'TODO Comment Found',
            description: 'Consider addressing TODO comments before merging.',
            filePath: filename,
            lineNumber,
            suggestion: 'Complete the TODO item or create a proper issue to track it.',
            isCommittable: false
          });
        }

        // Missing documentation
        if (/(function|class|interface|type).*\{/.test(line) && !lines[i - 1]?.includes('/**')) {
          results.push({
            type: 'suggestion',
            severity: 'info',
            title: 'Missing Documentation',
            description: 'Public functions and classes should have documentation.',
            filePath: filename,
            lineNumber,
            suggestion: 'Add JSDoc comments to document the purpose and parameters.',
            isCommittable: true
          });
        }
      }
    }

    return results;
  }

  /**
   * Analyze pull request at a high level
   */
  private async analyzePullRequestLevel(prData: any, files: any[]): Promise<CodeAnalysisResult[]> {
    const results: CodeAnalysisResult[] = [];

    // Check PR size
    const totalChanges = prData.additions + prData.deletions;
    if (totalChanges > 500) {
      results.push({
        type: 'suggestion',
        severity: 'warning',
        title: 'Large Pull Request',
        description: `This PR has ${totalChanges} changes. Consider breaking it into smaller PRs for easier review.`,
        suggestion: 'Split large changes into multiple focused pull requests.',
        isCommittable: false
      });
    }

    // Check for missing tests
    const hasTestChanges = files.some(file => 
      /test|spec|__tests__/.test(file.filename.toLowerCase())
    );
    const hasSourceChanges = files.some(file => 
      /\.(js|ts|py|java|go|rb)$/.test(file.filename) && 
      !/test|spec|__tests__/.test(file.filename.toLowerCase())
    );

    if (hasSourceChanges && !hasTestChanges) {
      results.push({
        type: 'suggestion',
        severity: 'warning',
        title: 'Missing Test Coverage',
        description: 'This PR modifies source code but doesn\'t include test changes.',
        suggestion: 'Consider adding tests to ensure the changes work as expected.',
        isCommittable: false
      });
    }

    return results;
  }

  /**
   * Extract line number from git patch format
   */
  private extractLineNumber(line: string, index: number): number | undefined {
    if (line.startsWith('@@')) {
      const match = line.match(/\+(\d+)/);
      return match ? parseInt(match[1]) : undefined;
    }
    return undefined;
  }

  /**
   * Count approximate function length (simplified)
   */
  private countFunctionLines(lines: string[], startIndex: number): number {
    let braceCount = 0;
    let lineCount = 0;
    let started = false;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('{')) {
        braceCount += (line.match(/\{/g) || []).length;
        started = true;
      }
      if (line.includes('}')) {
        braceCount -= (line.match(/\}/g) || []).length;
      }
      
      if (started) {
        lineCount++;
        if (braceCount === 0) {
          break;
        }
      }
    }

    return lineCount;
  }
}