import { Controller, Get, StreamableFile } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller()
@ApiTags('files')
export class AppController {
  @Get('terms')
  @ApiOperation({ summary: 'Download application terms of use in PDF format' })
  @ApiResponse({ status: 200, description: 'File downloaded with success' })
  @ApiResponse({ status: 400, description: 'Error in file download' })
  getTerms(): StreamableFile {
    const termsFile = createReadStream(
      join(process.cwd(), 'public/pada-terms.pdf'),
    );
    return new StreamableFile(termsFile, { type: '.pdf' });
  }

  @Get('privacy')
  @ApiOperation({
    summary: 'Download application terms of privacy in PDF format',
  })
  @ApiResponse({ status: 200, description: 'File downloaded with success' })
  @ApiResponse({ status: 400, description: 'Error in file download' })
  getPrivacy(): StreamableFile {
    const privacyFile = createReadStream(
      join(process.cwd(), 'public/pada-privacy.pdf'),
    );
    return new StreamableFile(privacyFile, { type: '.pdf' });
  }
}
