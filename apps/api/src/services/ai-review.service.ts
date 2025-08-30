import { 
  CodeReview, 
  CodeReviewFinding, 
  GitHubPullRequest,
  REVIEW_CONFIG,
  REVIEW_COMMENT_TEMPLATES
} from '@shared/index';
import { GitHubService } from './github.service';

interface ReviewableFile {
  path: string;
  content: string;
  language: string;
  additions: number;
  deletions: number;
  patch: string;
}

interface AIAnalysisResult {
  findings: CodeReviewFinding[];
  score: number;
  summary: string;
}

export class AIReviewService {
  private githubService: GitHubService;

  constructor(githubService: GitHubService) {
    this.githubService = githubService;
  }

  /**
   * Start AI review for a pull request
   */
  async reviewPullRequest(
    installationId: number,
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<CodeReview> {
    try {
      // Get pull request details
      const pullRequest = await this.githubService.getPullRequest(
        installationId,
        owner,
        repo,
        pullNumber
      );

      // Get pull request diff
      const diff = await this.githubService.getPullRequestDiff(
        installationId,
        owner,
        repo,
        pullNumber
      );

      // Parse reviewable files from diff
      const reviewableFiles = await this.parseReviewableFiles(
        diff,
        installationId,
        owner,
        repo,
        pullRequest.head.sha
      );

      // Perform AI analysis
      const analysis = await this.performAIAnalysis(reviewableFiles, pullRequest);

      // Create review object
      const review: CodeReview = {
        id: this.generateReviewId(),
        pullRequestId: pullRequest.id,
        repositoryId: pullRequest.base.repo.id,
        status: 'completed',
        findings: analysis.findings,
        summary: analysis.summary,
        score: analysis.score,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };

      // Post review comments to GitHub
      await this.postReviewToGitHub(
        installationId,
        owner,
        repo,
        pullNumber,
        review
      );

      return review;
    } catch (error) {
      console.error('AI review error:', error);
      throw new Error('Failed to complete AI review');
    }
  }

  /**
   * Parse diff to extract reviewable files
   */
  private async parseReviewableFiles(
    diff: string,
    installationId: number,
    owner: string,
    repo: string,
    sha: string
  ): Promise<ReviewableFile[]> {
    const files: ReviewableFile[] = [];
    
    // Simple diff parser (in production, use a proper diff parser library)
    const diffLines = diff.split('\n');
    let currentFile: Partial<ReviewableFile> | null = null;
    let patchLines: string[] = [];

    for (const line of diffLines) {
      if (line.startsWith('diff --git')) {
        // Save previous file
        if (currentFile && currentFile.path) {
          await this.finalizeFile(currentFile, patchLines, files, installationId, owner, repo, sha);
        }
        
        // Start new file
        const match = line.match(/diff --git a\/(.+) b\/(.+)/);
        if (match) {
          currentFile = {
            path: match[2],
            additions: 0,
            deletions: 0
          };
          patchLines = [line];
        }
      } else if (line.startsWith('+++') && currentFile) {
        const match = line.match(/\+\+\+ b\/(.+)/);
        if (match) {
          currentFile.path = match[1];
        }
        patchLines.push(line);
      } else if (line.startsWith('+') && !line.startsWith('+++') && currentFile) {
        currentFile.additions = (currentFile.additions || 0) + 1;
        patchLines.push(line);
      } else if (line.startsWith('-') && !line.startsWith('---') && currentFile) {
        currentFile.deletions = (currentFile.deletions || 0) + 1;
        patchLines.push(line);
      } else {
        patchLines.push(line);
      }
    }

    // Handle last file
    if (currentFile && currentFile.path) {
      await this.finalizeFile(currentFile, patchLines, files, installationId, owner, repo, sha);
    }

    return files.filter(file => this.isReviewableFile(file));
  }

  private async finalizeFile(
    fileData: Partial<ReviewableFile>,
    patchLines: string[],
    files: ReviewableFile[],
    installationId: number,
    owner: string,
    repo: string,
    sha: string
  ): Promise<void> {
    if (!fileData.path) return;

    try {
      // Get file content
      const content = await this.githubService.getFileContent(
        installationId,
        owner,
        repo,
        fileData.path,
        sha
      );

      files.push({
        path: fileData.path,
        content,
        language: this.detectLanguage(fileData.path),
        additions: fileData.additions || 0,
        deletions: fileData.deletions || 0,
        patch: patchLines.join('\n')
      });
    } catch (error) {
      // File might be deleted or binary, skip it
      console.warn(`Could not process file ${fileData.path}:`, error);
    }
  }

  /**
   * Check if file should be reviewed
   */
  private isReviewableFile(file: ReviewableFile): boolean {
    // Skip large files
    if (file.content.length > REVIEW_CONFIG.MAX_FILE_SIZE) {
      return false;
    }

    // Skip ignored paths
    for (const ignoredPath of REVIEW_CONFIG.IGNORED_PATHS) {
      if (file.path.includes(ignoredPath)) {
        return false;
      }
    }

    // Skip ignored extensions
    for (const ignoredExt of REVIEW_CONFIG.IGNORED_EXTENSIONS) {
      if (file.path.endsWith(ignoredExt)) {
        return false;
      }
    }

    // Only review supported languages
    return REVIEW_CONFIG.SUPPORTED_LANGUAGES.includes(file.language);
  }

  /**
   * Detect programming language from file path
   */
  private detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'cpp': 'cpp',
      'cc': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'swift': 'swift',
      'kt': 'kotlin'
    };

    return languageMap[ext || ''] || 'unknown';
  }

  /**
   * Perform AI analysis on reviewable files
   */
  private async performAIAnalysis(
    files: ReviewableFile[],
    pullRequest: GitHubPullRequest
  ): Promise<AIAnalysisResult> {
    // This is where you would integrate with your AI service (OpenAI, Claude, etc.)
    // For now, we'll return mock analysis with realistic findings
    
    const findings: CodeReviewFinding[] = [];
    let totalScore = 100;

    for (const file of files) {
      const fileFindings = await this.analyzeFile(file);
      findings.push(...fileFindings);
      
      // Reduce score based on findings
      totalScore -= fileFindings.reduce((penalty, finding) => {
        switch (finding.severity) {
          case 'critical': return penalty + 15;
          case 'high': return penalty + 10;
          case 'medium': return penalty + 5;
          case 'low': return penalty + 2;
          default: return penalty;
        }
      }, 0);
    }

    // Ensure score doesn't go below 0
    totalScore = Math.max(0, totalScore);

    // Generate summary
    const summary = this.generateSummary(findings, files.length, totalScore);

    return {
      findings,
      score: totalScore,
      summary
    };
  }

  /**
   * Analyze individual file for issues
   */
  private async analyzeFile(file: ReviewableFile): Promise<CodeReviewFinding[]> {
    // Mock AI analysis - in production, this would call your AI service
    const findings: CodeReviewFinding[] = [];
    const lines = file.content.split('\n');

    // Simple static analysis patterns
    const patterns = [
      {
        regex: /console\.log\(/g,
        type: 'suggestion' as const,
        severity: 'low' as const,
        category: 'best_practice' as const,
        title: 'Debug Statement Found',
        description: 'Consider removing console.log statements before merging to production.',
        suggestion: 'Use a proper logging library or remove debug statements.'
      },
      {
        regex: /TODO|FIXME|HACK/g,
        type: 'suggestion' as const,
        severity: 'medium' as const,
        category: 'maintainability' as const,
        title: 'TODO/FIXME Comment',
        description: 'TODO or FIXME comment found. Consider addressing before merging.',
        suggestion: 'Address the TODO item or create a follow-up issue.'
      },
      {
        regex: /eval\(/g,
        type: 'issue' as const,
        severity: 'critical' as const,
        category: 'security' as const,
        title: 'Dangerous eval() Usage',
        description: 'eval() can be dangerous and should be avoided.',
        suggestion: 'Use safer alternatives to eval() for dynamic code execution.'
      },
      {
        regex: /\.innerHTML\s*=/g,
        type: 'issue' as const,
        severity: 'high' as const,
        category: 'security' as const,
        title: 'Potential XSS Vulnerability',
        description: 'Direct innerHTML assignment can lead to XSS vulnerabilities.',
        suggestion: 'Use textContent or sanitize the HTML content before assignment.'
      }
    ];

    // Check each line for patterns
    lines.forEach((line, lineNumber) => {
      patterns.forEach(pattern => {
        const matches = line.match(pattern.regex);
        if (matches) {
          findings.push({
            id: this.generateFindingId(),
            type: pattern.type,
            severity: pattern.severity,
            title: pattern.title,
            description: pattern.description,
            file: file.path,
            line: lineNumber + 1,
            code: line.trim(),
            suggestion: pattern.suggestion,
            category: pattern.category
          });
        }
      });
    });

    return findings;
  }

  /**
   * Generate review summary
   */
  private generateSummary(findings: CodeReviewFinding[], fileCount: number, score: number): string {
    const criticalIssues = findings.filter(f => f.severity === 'critical').length;
    const highIssues = findings.filter(f => f.severity === 'high').length;
    const mediumIssues = findings.filter(f => f.severity === 'medium').length;
    const lowIssues = findings.filter(f => f.severity === 'low').length;

    let summary = `## 🤖 Mesrai AI Review Summary\n\n`;
    summary += `**Files Analyzed:** ${fileCount}\n`;
    summary += `**Overall Score:** ${score}/100\n`;
    summary += `**Total Issues:** ${findings.length}\n\n`;

    if (findings.length > 0) {
      summary += `### Issue Breakdown\n`;
      if (criticalIssues > 0) summary += `- 🔴 Critical: ${criticalIssues}\n`;
      if (highIssues > 0) summary += `- 🟠 High: ${highIssues}\n`;
      if (mediumIssues > 0) summary += `- 🟡 Medium: ${mediumIssues}\n`;
      if (lowIssues > 0) summary += `- 🔵 Low: ${lowIssues}\n`;
      summary += `\n`;
    }

    if (score >= 90) {
      summary += `✅ **Excellent code quality!** This pull request follows best practices with minimal issues.`;
    } else if (score >= 70) {
      summary += `👍 **Good code quality** with some minor improvements suggested.`;
    } else if (score >= 50) {
      summary += `⚠️ **Moderate code quality** - several issues should be addressed before merging.`;
    } else {
      summary += `❌ **Poor code quality** - significant issues need to be resolved before merging.`;
    }

    return summary;
  }

  /**
   * Post review results to GitHub
   */
  private async postReviewToGitHub(
    installationId: number,
    owner: string,
    repo: string,
    pullNumber: number,
    review: CodeReview
  ): Promise<void> {
    try {
      // Post main review comment
      await this.githubService.createPullRequestComment(
        installationId,
        owner,
        repo,
        pullNumber,
        review.summary
      );

      // Post individual findings as review comments
      const reviewComments = review.findings.map(finding => ({
        path: finding.file,
        line: finding.line,
        body: this.formatFindingComment(finding)
      }));

      if (reviewComments.length > 0) {
        await this.githubService.createPullRequestReview(
          installationId,
          owner,
          repo,
          pullNumber,
          reviewComments,
          REVIEW_COMMENT_TEMPLATES.REVIEW_COMPLETED(review.score, review.findings.length)
        );
      }
    } catch (error) {
      console.error('Error posting review to GitHub:', error);
      throw error;
    }
  }

  /**
   * Format a finding as a GitHub comment
   */
  private formatFindingComment(finding: CodeReviewFinding): string {
    const severityEmoji = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵'
    };

    const categoryEmoji = {
      security: '🔒',
      performance: '⚡',
      bug: '🐛',
      style: '✨',
      maintainability: '🔧',
      best_practice: '💡'
    };

    let comment = `${severityEmoji[finding.severity]} ${categoryEmoji[finding.category]} **${finding.title}**\n\n`;
    comment += `${finding.description}\n\n`;
    
    if (finding.suggestion) {
      comment += `💡 **Suggestion:** ${finding.suggestion}\n\n`;
    }
    
    if (finding.code) {
      comment += `**Code:**\n\`\`\`\n${finding.code}\n\`\`\``;
    }

    return comment;
  }

  private generateReviewId(): string {
    return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFindingId(): string {
    return `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}