import { BaseClient } from '@lark-base-open/node-sdk';
import { uploadFilesByBuffer } from '../uitls/upload';

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


	const records: any[] = [];
	for (let i = 0; i < tableData.length; i++) {

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
				const fileTokens = await uploadFilesByBuffer(client, valuesSplits)
				newFields[key] = [
					...fileTokens
				]
			} else if (uiType === 'DateTime' && key === '日期' && tableData[i]['date']) {
				newFields[key] = new Date(`${tableData[i]['date']} 00:00:00`).getTime()
			}
		}
		records.push({ ...newFields });
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

	// try {
	// 	await client.base.appTableRecord.batchCreate({
	// 		path: {
	// 			table_id: TABLEID
	// 		},
	// 		data: {
	// 			records: [...records]
	// 		}
	// 	})
	// } catch (error) {
	// 	console.log('error-----', error)
	// }
}