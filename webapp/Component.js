sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sdu001/ZSDAPP_SCAN_CUST_DEL_CENTR_WH_BR/model/models",
	"sap/ui/fl/FakeLrepConnectorLocalStorage"
], function (UIComponent, Device, models, FakeLrepConnectorLocalStorage) {
	"use strict";

	return UIComponent.extend("sdu001.ZSDAPP_SCAN_CUST_DEL_CENTR_WH_BR.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			// FakeLrepConnectorLocalStorage.enableFakeConnector(sap.ui.require.toUrl("sap/ui/demo/smartControls/lrep/component-test-changes.json"));
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function () {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},

		destroy: function () {
			// this._oErrorHandler.destroy();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		}
	});
});