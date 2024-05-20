import { fetchFileStream } from './request_file';
import path from 'path'
import fs from 'fs'

export async function uploadFile(client, url) {
	const filePath = path.resolve(__dirname, `../cache_files/${client.appToken}.png`)
	await fetchFileStream(url, filePath);
	const data = await client.drive.media.uploadAll({
		data: {
			file_name: 'file.png', // 文件名
			parent_type: 'bitable_file', // 附件为图片传 'bitable_image'，为文件传 'bitable_file'
			parent_node: client.appToken, // 填写 appToken
			size: fs.statSync(filePath).size, // 文件大小
			file: fs.createReadStream(filePath), // 文件流
		}
	})
	const fileToken = data.file_token;
	return fileToken
}

export async function uploadFiles(client, datas) {
	const result: any = []
	for (let i = 0; i < datas.length; i ++) {
		const fileToken = await uploadFile(client, datas[i])
		result.push(
			{ file_token: fileToken }
		)
	}
	return result
}
