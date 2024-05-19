import { BaseClient } from '@lark-base-open/node-sdk';
import { config } from '../config';

interface IRecord {
	record_id: string;
	fields: Record<string, any>
}





export async function jikeInsert(tableData, config ) {
	const APP_TOKEN = config.APP_TOKEN
	const PERSONAL_BASE_TOKEN = config.PERSONAL_BASE_TOKEN
	const TABLEID = config.TABLEID
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
	})

	const fields = res?.data?.items || [];
	const textFieldNames = fields.filter(field => field.ui_type === 'Text').map(field => field.field_name);


	for (let i = 0; i < tableData.length; i++) {
		// if (i % 10 === 0) { 
		// 	await waitTime(1000)
		// }
		const newFields = {}
		textFieldNames.forEach(key => newFields[key] = String(tableData[i][key])  )
		try {
			await client.base.appTableRecord.create({
				path: {
					table_id: TABLEID
				},
				data: {
					fields: {
						...newFields
					}
				}
			})
		} catch (error) {
			console.log('error-----', error)
		}
	}
}