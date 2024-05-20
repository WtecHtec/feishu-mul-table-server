import { BaseClient } from '@lark-base-open/node-sdk';
import { uploadFiles } from '../uitls/upload';

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
	// const textFieldNames = fields.filter(field => field.ui_type === 'Text').map(field => field.field_name);


	for (let i = 0; i < tableData.length; i++) {
		// if (i % 10 === 0) { 
		// 	await waitTime(1000)
		// }
		const newFields = {}
		for (let j = 0; j < fields.length; j++) {
			const field = fields[j]
			const uiType = field.ui_type
			const key = field.field_name
			const values = tableData[i][key]
			if ( uiType === 'Text') {
				newFields[key] = String( values || '')
			} else if ( uiType === 'Attachment' && values) {
				const valuesSplits = values.split(',').filter(item => item)
				const fileTokens = await uploadFiles(client, valuesSplits)
				newFields[key] = [
					...fileTokens
				]
			}
		}
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