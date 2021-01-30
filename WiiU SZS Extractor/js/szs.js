			function h2d(d,c,b,a){
				var val = Math.round(d*Math.pow(16,6)+c*Math.pow(16,4)+b*Math.pow(16,2)+a*1);
				return val;
			}
			function main(){
				var file = document.getElementById("bfsrc").files[0];
				var fileReader = new FileReader();
				fileReader.onload = function(){
					var filedata = {bytes:this.result, name:file.name, mime:file.type};
					if(filedata) filterData(filedata);
				};
				fileReader.readAsArrayBuffer(file);
              
			}
			function filterData(data){
				var hed  = new Uint8Array(data.bytes,0,8);
				var uncom  = h2d(hed[4],hed[5],hed[6],hed[7]);
				var flag = h2d(hed[0],hed[1],hed[2],hed[3]);
				
				var dst    = new Uint8Array(uncom);
				var brc    = new Uint8Array(data.bytes,16);
				
				if(flag == 0x59617A30){
					decode(brc,dst,uncom,data);
				}else{
					alert("This File Not WiiU SZS Yaz0 Format\n"+"Please Enter The Right SZS Yaz0 File Format.");
				}
			}
			function decode(src, dst, uncompressedSize,data){
				var srcPlace = 0;
				var dstPlace = 0;
				//current read/write positions
  
				var validBitCount = new Uint8Array();
				validBitCount = 0;
				//number of valid bits left in "code" byte
				var currCodeByte  = new Uint8Array();
				currByteCode = 0;
				
				while(dstPlace < uncompressedSize){
					//read new "code" byte if the current one is used up
					if(validBitCount == 0){
						currCodeByte = src[srcPlace];
						srcPlace++;
						validBitCount = 8;
					}
					if((currCodeByte & 0x80) != 0){
						//straight copy
						dst[dstPlace] = src[srcPlace];
						dstPlace++;
						srcPlace++;
					}else{
						//RLE part
						var byte1 = new Uint8Array();
						byte1 = src[srcPlace];
						var byte2 = new Uint8Array();
						byte2 = src[srcPlace + 1];
						srcPlace += 2;
						var dist = new Uint8Array();
						dist = ((byte1 & 0xF) << 8) | byte2;
						var copySource = new Uint8Array();
						copySource = dstPlace - (dist + 1);
						var numBytes = new Uint8Array();
						numBytes = byte1 >> 4;
						if(numBytes == 0){
							numBytes = src[srcPlace] + 0x12;
							srcPlace++;
						}else
							numBytes += 2;
						//copy run
						for(var i = 0; i < numBytes; i++){
							dst[dstPlace] = dst[copySource];
							copySource++;
							dstPlace++;
						}
					}
					//use next bit from "code" byte
					currCodeByte = currCodeByte << 1;
					validBitCount-=1;
				}
				
				download(dst,data.name);
			}
			function download(data,name){
			    alert("Download Ready");
				var nam = name.substring(0, name.lastIndexOf("."));
				var a = document.createElement("a");
				a.href = URL.createObjectURL(new Blob([data], {type:"application/octet-stream" }));
				a.setAttribute("download",nam);
				a.style.display = "none";
				document.body.appendChild(a);
				setTimeout(function() {
					a.click();
					document.body.removeChild(a);
					setTimeout(function(){ self.URL.revokeObjectURL(a.href); }, 250);
				}, 66);
			}
