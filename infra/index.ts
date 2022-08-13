import {resources, storage, web} from "@pulumi/azure-native";
import {StorageUtils} from "./storage";
import * as pulumi from '@pulumi/pulumi';

export const rg = new resources.ResourceGroup('prisma-az-perf');
const config = new pulumi.Config();
const storageAccount = new storage.StorageAccount('sa', {
	resourceGroupName: rg.name,
	sku: {
		name: storage.SkuName.Standard_LRS,
	},
	kind: storage.Kind.StorageV2,
});

const codeContainer = new storage.BlobContainer('zips', {
	resourceGroupName: rg.name,
	accountName: storageAccount.name,
});

const codeBlob = new storage.Blob('zip', {
	resourceGroupName: rg.name,
	accountName: storageAccount.name,
	containerName: codeContainer.name,
	source: new pulumi.asset.FileArchive('../functions'),
});

const plan = new web.AppServicePlan('plan', {
	resourceGroupName: rg.name,
	kind: 'Linux',
	sku: {
		name: 'Y1',
		tier: 'Dynamic',
	},
	reserved: true,
});

const app = new web.WebApp('fa', {
	resourceGroupName: rg.name,
	serverFarmId: plan.id,
	kind: 'functionapp',
	siteConfig: {
		appSettings: [
			{ name: 'AzureWebJobsStorage', value: StorageUtils.connection(rg.name, storageAccount.name) },
			{ name: 'FUNCTIONS_EXTENSION_VERSION', value: '~4' },
			{ name: 'FUNCTIONS_WORKER_RUNTIME', value: 'node' },
			{ name: 'WEBSITE_NODE_DEFAULT_VERSION', value: '~16' },
			{ name: 'WEBSITE_RUN_FROM_PACKAGE', value: StorageUtils.url(codeBlob, codeContainer, storageAccount, rg) },
			{ name: "EVENTHUB_NAME", value: "iot-events"},
		],
		http20Enabled: true,
		linuxFxVersion: 'node|16',
		nodeVersion: '~16',
	},
});