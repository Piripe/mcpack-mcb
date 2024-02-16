import fs from "fs";
import path from "path";

const cachePath = "./cache"

const importRegex = /(^(import|export).+from\s".+)(ts)(";)$/gm;

fs.readdirSync(cachePath).forEach(file=>{
    if (fs.statSync(path.join(cachePath,file)).isFile) {
        fs.writeFileSync(path.join(cachePath,file),fs.readFileSync(path.join(cachePath,file)).toString().replace(importRegex,(x)=>{
            let w = x.matchAll(importRegex).next().value;
            return w[1]+"js"+w[4];
        }));
    }
});