/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sdu001/ZSDAPP_SCAN_CUST_DEL_CENTR_WH_BR/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});