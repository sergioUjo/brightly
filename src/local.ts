import * as fs from "fs";
import {run} from "./index";

function storeImage(image: Buffer) {
    fs.writeFileSync(__dirname + "/../screenshot.png", image);
}

run().then(storeImage);

