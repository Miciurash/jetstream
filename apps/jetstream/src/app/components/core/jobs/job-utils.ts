import { AsyncJob, RecordResult, ErrorResult } from '@jetstream/types';
import { unparse } from 'papaparse';
import { saveFile } from '@jetstream/shared/ui-utils';
import { MIME_TYPES } from '@jetstream/shared/constants';

export function downloadJob(job: AsyncJob) {
  switch (job.type) {
    case 'BulkDelete': {
      const results = job.results as RecordResult[];

      const data = results.map((result) => {
        if (result.success) {
          return {
            id: result.id,
            success: true,
            errors: '',
            fields: '',
          };
        } else {
          const errors = (result as ErrorResult).errors;
          return {
            id: '',
            success: false,
            errors: errors.map((error) => error.message).join(';'),
            fields: errors.map((error) => error.fields).join(';'),
          };
        }
      });

      const csv = unparse(
        {
          data,
          fields: ['id', 'success', 'errors', 'fields'],
        },
        { header: true, quotes: true }
      );

      saveFile(csv, `job-results-${job.id}.csv`, MIME_TYPES.CSV);

      break;
    }
    default:
      break;
  }
}
