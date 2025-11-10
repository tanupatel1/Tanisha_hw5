function createBufferFromIndices(gl, positions, normals, uvs, tangents, indices){
  const pos=[], nrm=[], uv=[], tan=[];
  for(let i=0;i<indices.length;i++){
    const idx = indices[i]*3;
    pos.push(positions[idx], positions[idx+1], positions[idx+2]);
    nrm.push(normals[idx], normals[idx+1], normals[idx+2]);
    uv.push(uvs[indices[i]*2], uvs[indices[i]*2+1]);
    tan.push(tangents[idx], tangents[idx+1], tangents[idx+2]);
  }
  const o = {};
  o.vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,o.vbo); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.STATIC_DRAW);
  o.nbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,o.nbo); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(nrm),gl.STATIC_DRAW);
  o.uvbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,o.uvbo); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(uv),gl.STATIC_DRAW);
  o.tbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,o.tbo); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(tan),gl.STATIC_DRAW);
  o.vertexCount = pos.length/3;
  return o;
}

// ===== Sphere =====
function createSphere(gl, radius=0.5, latBands=24, longBands=24){
  const positions=[], normals=[], uvs=[], tangents=[], indices=[];
  for(let lat=0; lat<=latBands; lat++){
    const theta = lat * Math.PI / latBands;
    const sinT = Math.sin(theta), cosT = Math.cos(theta);
    for(let lon=0; lon<=longBands; lon++){
      const phi = lon * 2 * Math.PI / longBands;
      const x = radius * sinT * Math.cos(phi);
      const y = radius * cosT;
      const z = radius * sinT * Math.sin(phi);
      positions.push(x,y,z);
      normals.push(x/radius,y/radius,z/radius);
      uvs.push(lon/longBands, lat/latBands);
      tangents.push(-Math.sin(phi),0,Math.cos(phi));
    }
  }
  for(let lat=0; lat<latBands; lat++){
    for(let lon=0; lon<longBands; lon++){
      const first = lat*(longBands+1)+lon;
      const second = first + longBands + 1;
      indices.push(first,second,first+1, second,second+1, first+1);
    }
  }
  return createBufferFromIndices(gl, positions, normals, uvs, tangents, indices);
}

// ===== Cylinder =====
function createCylinder(gl, radius=0.3, height=0.8, segments=32){
  const positions=[], normals=[], uvs=[], tangents=[], indices=[];
  for(let i=0;i<=segments;i++){
    const theta=i*2*Math.PI/segments;
    const x=radius*Math.cos(theta), z=radius*Math.sin(theta);
    positions.push(x,-height/2,z, x,height/2,z);
    normals.push(x,0,z, x,0,z);
    uvs.push(i/segments,0, i/segments,1);
    tangents.push(-Math.sin(theta),0,Math.cos(theta), -Math.sin(theta),0,Math.cos(theta));
  }
  for(let i=0;i<segments;i++){
    const a=i*2,b=a+1,c=a+2,d=a+3;
    indices.push(a,b,c,b,d,c);
  }
  return createBufferFromIndices(gl, positions, normals, uvs, tangents, indices);
}

// ===== Cone =====
function createCone(gl, radius=0.4, height=0.7, segments=32){
  const positions=[], normals=[], uvs=[], tangents=[], indices=[];
  positions.push(0,height/2,0); normals.push(0,1,0); uvs.push(0.5,1); tangents.push(1,0,0);
  for(let i=0;i<=segments;i++){
    const theta=i*2*Math.PI/segments;
    const x=radius*Math.cos(theta), z=radius*Math.sin(theta);
    positions.push(x,-height/2,z);
    normals.push(x,0,z);
    uvs.push((Math.cos(theta)+1)/2,0);
    tangents.push(-Math.sin(theta),0,Math.cos(theta));
  }
  for(let i=1;i<=segments;i++){
    indices.push(0,i,i+1);
  }
  return createBufferFromIndices(gl, positions, normals, uvs, tangents, indices);
}

// ===== Torus =====
function createTorus(gl, r=0.3, c=0.1, segR=24, segC=12){
  const positions=[], normals=[], uvs=[], tangents=[], indices=[];
  for(let i=0;i<=segR;i++){
    const theta=i*2*Math.PI/segR;
    const cosT=Math.cos(theta), sinT=Math.sin(theta);
    for(let j=0;j<=segC;j++){
      const phi=j*2*Math.PI/segC;
      const cosP=Math.cos(phi), sinP=Math.sin(phi);
      const x=(r+c*cosP)*cosT, y=c*sinP, z=(r+c*cosP)*sinT;
      positions.push(x,y,z);
      const nx = cosP*cosT, ny=sinP, nz=cosP*sinT;
      normals.push(nx,ny,nz);
      uvs.push(i/segR,j/segC);
      tangents.push(-sinT,0,cosT);
    }
  }
  for(let i=0;i<segR;i++){
    for(let j=0;j<segC;j++){
      const a=i*(segC+1)+j, b=a+segC+1;
      indices.push(a,b,a+1,b,b+1,a+1);
    }
  }
  return createBufferFromIndices(gl, positions, normals, uvs, tangents, indices);
}

// ===== Checker Texture =====
function makeChecksTexture(size=256,numChecks=8){
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cs = size/numChecks;
  for(let y=0;y<numChecks;y++){
    for(let x=0;x<numChecks;x++){
      ctx.fillStyle = (x+y)%2===0?'#fff':'#000';
      ctx.fillRect(x*cs,y*cs,cs,cs);
    }
  }
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,canvas);
  gl.generateMipmap(gl.TEXTURE_2D);
  return tex;
}
