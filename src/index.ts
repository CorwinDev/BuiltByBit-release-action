import * as core from "@actions/core";
import * as fs from "fs";
import * as path from "path";

interface VersionPayload {
    resource_id: number;
    version_name: string;
    file: {
        name: string;
        data: string;
    };
    update?: {
        post: boolean;
        title: string;
        message: string;
    };
}

async function run(): Promise<void> {
    core.info("Starting BuiltByBit Release Publisher...");
    try {
        const apiToken = core.getInput("api_token", { required: true });
        const resourceId = core.getInput("resource_id", { required: true });
        const apiUrl = core.getInput("api_url", { required: true });
        const version = core.getInput("version", { required: true });
        const filePath = core.getInput("file", { required: true });

        const postUpdate = core.getInput("post_update") === "true";
        const title = core.getInput("title") || "";
        const message = core.getInput("message") || "";

        if (!fs.existsSync(filePath)) {
            core.setFailed(`File not found at path: ${filePath}`);
            return;
        }

        core.info(`Reading file: ${filePath}`);

        const fileBuffer = fs.readFileSync(filePath);
        const base64 = fileBuffer.toString("base64");
        const fileName = path.basename(filePath);

        const payload: VersionPayload = {
            resource_id: Number(resourceId),
            version_name: version,
            file: {
                name: fileName,
                data: base64,
            },
        };

        if (postUpdate) {
            if (!title || !message) {
                core.setFailed("Title and message are required when post_update is true.");
                return;
            }
            payload.update = {
                post: true,
                title,
                message,
            };
        }

        core.info("Uploading to BuiltByBit...");

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                Authorization: `Token ${apiToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const responseText = await response.text();

        core.info(`Response status: ${response.status}`);

        if (!response.ok) {
            core.setFailed(`API Error: ${response.status}\n${responseText}`);
            return;
        }

        core.info("✅ Version successfully published to BuiltByBit!");
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        } else {
            core.setFailed("An unknown error occurred.");
        }
    }
}

run();
