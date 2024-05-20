const http = require('https'); // for HTTP URLs

const fs = require('fs');
async function fetchFileStream(url, filename) {
  const [response, size ]= await makeRequest(url);
	const fileStream = fs.createWriteStream(filename);  
  response.pipe(fileStream);
  return  new Promise( (resolve) => {
		fileStream.on('finish', () => {  
			console.log('文件写入完成'); 
		});  
		fileStream.on('close', () => {  
			resolve([fileStream, size])
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

			const contentLength = response.headers['content-length'];  
			if (contentLength) {  
				console.log(`文件大小: ${contentLength} 字节`);  
			} else {  
				console.log('Content-Length 头部未提供，无法确定文件大小');  
			}  

      resolve([response, contentLength]);
    });

    request.on('error', (error) => {
      reject(error);
    });
  });
}



export { fetchFileStream }