import cp from "child_process";
import fs from "fs";

const commit = cp.execSync("git rev-parse HEAD").toString().trim();
const commitShort = cp.execSync("git rev-parse --short HEAD").toString().trim();

fs.writeFileSync(
	`${__dirname}/../dist/version.txt`,
	`

date:           ${new Date().toISOString()}
commit:         ${commit}
commit (short): ${commitShort}

`.trim(),
);
