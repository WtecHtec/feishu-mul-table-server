import { axiosFileBuffer, fetchFileStream } from './request_file';
import path from 'path'
import fs from 'fs'
import { Readable } from 'stream';
const maxSize = 20 * 1024 * 1024;  
export async function uploadFile(client, url) {
	let filePath = path.resolve(__dirname, `../cache_files/${client.appToken}`)
	const [, saveFilePath, expand] = await fetchFileStream(url, filePath);
	filePath = saveFilePath;
	if (fs.statSync(filePath).size > maxSize) return '';
	const data = await client.drive.media.uploadAll({
		data: {
			file_name: `file${expand}`, // 文件名
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



export async function uploadFileByBuffer(client, url) {
	// axios 获取arraybuffer 数据不是很稳定，有时候会出现空白
	const [imageBuffer, expand] = await axiosFileBuffer(url);
	if (imageBuffer.length > maxSize) return ''
	const data = await client.drive.media.uploadAll({
		data: {
			file_name: `file${expand}`, // 文件名
			parent_type: 'bitable_file', // 附件为图片传 'bitable_image'，为文件传 'bitable_file'
			parent_node: client.appToken, // 填写 appToken
			size: imageBuffer.length, // 文件大小
			file: Readable.from(imageBuffer), // 文件流
		}
	})
	const fileToken = data.file_token;
	return fileToken
}

export async function uploadFilesByBuffer(client, datas) {
	const result: any = []
	for (let i = 0; i < datas.length; i ++) {
		const fileToken = await uploadFileByBuffer(client, datas[i])
		result.push(
			{ file_token: fileToken }
		)
	}
	return result
}
 