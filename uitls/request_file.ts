import axios from "axios";

const http = require('https'); // for HTTP URLs

const fs = require('fs');
/**
 * 根据url添加文件扩展
 * @param url 
 * @param filename 
 * @returns 
 */
async function fetchFileStream(url, filename): Promise<any> {
  const [response, contentType ]= await makeRequest(url);
	console.log('MIME Type from Response:', contentType);
	const fixMap = {
		image: '.png',
		video: '.mp4'
	}
	const expand = fixMap[contentType.split('/')[0]] || '.png'
	const filePath = `${filename}${expand}`
	const fileStream = fs.createWriteStream(filePath);  
  response.pipe(fileStream);
  return  new Promise( (resolve) => {
		fileStream.on('finish', () => {  
		
		});  
		fileStream.on('close', () => {  
			resolve([fileStream, filePath, expand])
		});  
	})
}

async function makeRequest(url): Promise<any> {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Error fetching file: ${response.statusCode}`));
        return;
      }
			const contentType = response.headers['content-type'];  
			console.log('MIME Type from Headers:', contentType);  

      resolve([response, contentType]);
    });

    request.on('error', (error) => {
      reject(error);
    });
  });
}


const axiosFileBuffer = async (url) => {
	const imageResponse = await axios.get(url, { responseType: 'arraybuffer' });
	const imageBuffer = Buffer.from(imageResponse.data, 'binary');
	const contentType = imageResponse.headers['content-type']
	let expand = '.png'
	if (contentType) {
		const cts = contentType.split('/')
		expand = `.${cts[cts.length - 1]}`
	}
	return [imageBuffer,  expand]
}




export { fetchFileStream, axiosFileBuffer }
