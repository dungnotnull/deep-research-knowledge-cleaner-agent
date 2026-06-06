import { Injectable, Logger } from '@nestjs/common';
import { RawDocument } from '../crawlers/types';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class HardRejectionService {
  private readonly logger = new Logger(HardRejectionService.name);
  private readonly blacklistPath = path.join(process.cwd(), 'config/blacklist.txt');

  async filter(docs: RawDocument[]): Promise<{ accepted: RawDocument[], rejected: any[] }> {
    const accepted = [];
    const rejected = [];
    const blacklist = this.loadBlacklist();

    for (const doc of docs) {
      let reason = '';

      if (doc.wordCount < 300) {
        reason = 'word_count_too_low';
      } else if (!doc.author && !doc.publishDate) {
        reason = 'missing_metadata';
      } else if (blacklist.some(domain => doc.url.includes(domain))) {
        reason = 'domain_blacklisted';
      }

      if (reason) {
        this.logger.warn(\Rejecting document \: \\);
        rejected.push({ doc, reason });
      } else {
        accepted.push(doc);
      }
    }

    this.logRejections(rejected);
    return { accepted, rejected };
  }

  private loadBlacklist(): string[] {
    try {
      return fs.readFileSync(this.blacklistPath, 'utf8').split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }

  private logRejections(rejected: any[]) {
    const logPath = path.join(process.cwd(), 'logs/rejected-sources.log');
    const entries = rejected.map(r => \[\] ID: \ | URL: \ | Reason: \\).join('\n');
    fs.appendFileSync(logPath, entries + '\n');
  }
}
