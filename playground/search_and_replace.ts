import { BaseClient } from '@lark-base-open/node-sdk';
import { config } from '../config';

interface IRecord {
  record_id: string;
  fields: Record<string, any>
}

const APP_TOKEN = config.APP_TOKEN
const PERSONAL_BASE_TOKEN = config.PERSONAL_BASE_TOKEN
const TABLEID = config.TABLEID

// search_and_replace
export async function searchAndReplace(from: string, to: string) {
  
  // new BaseClient，fill appToken & personalBaseToken
  const client = new BaseClient({
    appToken: APP_TOKEN,
    personalBaseToken: PERSONAL_BASE_TOKEN,
  });
  
  // obtain fields info
  const res = await client.base.appTableField.list({
    params: {
      page_size: 100,
    },
    path: {
      table_id: TABLEID,
    }
  });
  const fields = res?.data?.items || [];
  const textFieldNames = fields.filter(field => field.ui_type === 'Text').map(field => field.field_name);
  console.log('>>> Text fields', JSON.stringify(textFieldNames));

  // iterate over all records
  for await (const data of await client.base.appTableRecord.listWithIterator({ params: { page_size: 50 }, path: { table_id: TABLEID } })) {
    const records = data?.items || [];
    console.log('>>> records', JSON.stringify(records));
    const newRecords: IRecord[] = [];
    for (const record of records) {
      const { record_id, fields } = record || {};
      const entries = Object.entries<string>(fields);
      const newFields: Record<string, string> = {};
      for (const [key, value] of entries) {
        // replace value
        if ((textFieldNames.includes(key)) && value) {
          const newValue = value.replace(new RegExp(from, 'g'), to);
          // add into newFields if needed
          newValue !== value && (newFields[key] = newValue);
        }
      }
      // add into newRecords if needed
      Object.keys(newFields).length && newRecords.push({
        record_id,
        fields: newFields,
      })
    }
    console.log('>>> new records', JSON.stringify(newRecords));

    // batch update records
    await client.base.appTableRecord.batchUpdate({
      path: {
        table_id: TABLEID,
      },
      data: {
        records: newRecords
      }
    })
  }
  console.log('success')
}


console.log('start')