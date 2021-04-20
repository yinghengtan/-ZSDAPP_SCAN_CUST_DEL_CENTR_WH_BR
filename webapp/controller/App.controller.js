sap.ui.define([
	"sdu001/ZSDAPP_SCAN_CUST_DEL_CENTR_WH_BR/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("sdu001.ZSDAPP_SCAN_CUST_DEL_CENTR_WH_BR.controller.App", {
		onInit: function () {
			var oModel = this.getView().getModel("CustomerDelivery");
			this.getOwnerComponent().setModel(oModel);

			//Set Customer Delivery model as default model
			this.getView().setModel(oModel);

			var oViewModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});
			this.setModel(oViewModel, "appView");

			fnSetAppNotBusy = function () {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			// disable busy indication when the metadata is loaded and in case of errors
			this.getOwnerComponent().getModel().metadataLoaded().
			then(fnSetAppNotBusy);
			this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}
	});
});