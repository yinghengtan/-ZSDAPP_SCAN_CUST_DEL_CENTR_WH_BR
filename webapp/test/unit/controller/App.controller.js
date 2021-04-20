/*global QUnit*/

sap.ui.define([
	"sdu001/ZSDAPP_SCAN_CUST_DEL_CENTR_WH_BR/controller/App.controller"
], function (Controller) {
	"use strict";

	QUnit.module("App Controller");

	QUnit.test("I should test the App controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});