import { Controller, Get, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller()
export class AppController {
  @Get('terms')
  getTerms(): StreamableFile {
    const termsFile = createReadStream(
      join(process.cwd(), 'public/pada-terms.pdf'),
    );
    return new StreamableFile(termsFile, { type: '.pdf' });
  }

  @Get('privacy')
  getPrivacy(): StreamableFile {
    const privacyFile = createReadStream(
      join(process.cwd(), 'public/pada-privacy.pdf'),
    );
    return new StreamableFile(privacyFile, { type: '.pdf' });
  }
}
