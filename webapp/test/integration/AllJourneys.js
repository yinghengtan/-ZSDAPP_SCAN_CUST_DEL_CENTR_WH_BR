sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangements/Startup",
	"./NavigationJourney"
], function (Opa5, Startup) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "sdu001.ZSDAPP_SCAN_CUST_DEL_CENTR_WH_BR.view.",
		autoWait: true
	});
});