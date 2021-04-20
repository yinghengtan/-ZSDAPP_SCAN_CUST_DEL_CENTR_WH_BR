sap.ui.define([
	"sdu001/ZSDAPP_SCAN_CUST_DEL_CENTR_WH_BR/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ndc/BarcodeScanner",
	"sap/m/MessageBox"
], function (BaseController, Filter, FilterOperator, BarcodeScanner, MessageBox) {
	"use strict";

	return BaseController.extend("sdu001.ZSDAPP_SCAN_CUST_DEL_CENTR_WH_BR.controller.S1_DeliveryList", {
		onInit: function () {
			var oModel = this.getOwnerComponent().getModel();
			oModel.setSizeLimit("9999");
		},

		onInitSmartFilter: function (oEvent) {
			var oView = this.getView(),
				oSmartFilter = oView.byId("smartFilterBarId"),
				sToday = new Date();

			//Set up To date as today date
			var oJSONData = {
				Wadat: {
					ranges: [{
						exclude: false,
						keyField: "Wadat",
						operation: "LE",
						value1: sToday
					}]
				}
			};

			//Push date into smart filter
			oSmartFilter.setFilterData(oJSONData, true);
		},

		onAfterRendering: function () {
			var oView = this.getView();

			//Call busy dialog
			if (!this.oBusyDialog) {
				this.oBusyDialog = sap.ui.xmlfragment(oView.getId(), "sdu001.ZSDAPP_SCAN_CUST_DEL_CENTR_WH_BR.view.fragment.BusyDialog", this);
				oView.addDependent(this.oBusyDialog);
			}
		},

		setBusyDiaolog: function (bBusy) {
			if (bBusy) {
				this.oBusyDialog.open();
			} else {
				this.oBusyDialog.close();
			}
		},

		onItemPress: function (oEvent) {
			var oSelectedData = oEvent.getSource().getBindingContext(),
				sVbelnVa = oSelectedData.getProperty("VbelnVa"),
				sVbelnVl = oSelectedData.getProperty("VbelnVl"),
				oModel = this.getView().getModel("CustomerDelivery"),
				aFilter = [];
				
			// Set up filter
			aFilter.push(new Filter("VbelnVa", FilterOperator.EQ, sVbelnVa));
			aFilter.push(new Filter("VbelnVl", FilterOperator.EQ, sVbelnVl));

			//Call read odata to get selected line value
			this.setBusyDiaolog(true);
			oModel.read("/DeliveryListSet", {
				filters: aFilter,
				success: function (response) {
					var aResults = response.results,
						sResultsLength = aResults.length;

					if (sResultsLength > 0) {
						if (aResults[0].Wbstk !== "C") {
							//Navigate to Delivery Detail screen 
							this.getRouter().getTargets().display("S2_DeliveryHeaderItem", {
								fromTarget: "S1_DeliveryList",
								VbelnVa: aResults[0].VbelnVa,
								VbelnVl: aResults[0].VbelnVl,
								VbelnS4: aResults[0].VbelnS4,
								Kunnr: aResults[0].Kunnr,
								Name1: aResults[0].Name1,
								Auart: aResults[0].Auart,
								Sort1: aResults[0].Sort1,
								Mtart: aResults[0].Mtart,
								Matkl: aResults[0].Matkl,
								Lgort: aResults[0].Lgort,
								Lgobe: aResults[0].Lgobe,
								Wbstk: aResults[0].Wbstk,
								ZwbstkTxt: aResults[0].ZwbstkTxt
							});
						}
					}

					this.setBusyDiaolog(false);
				}.bind(this),
				error: function (oError) {
					this.setBusyDiaolog(false);
					this.displayServerMessage(oError);
				}.bind(this)
			});
		},

		onSaveVariant: function () {
			var oSmartFilter = this.getView().byId("smartFilterBarId");

			var oRadionButtonGrp = this.getView().byId("radioButtonGroupId"),
				oSelectIndex = oRadionButtonGrp.getSelectedIndex();

			var oRadionButtonViewTypeGrp = this.getView().byId("radioButtonViewTypeGroupId"),
				oSelectViewTypeIndex = oRadionButtonViewTypeGrp.getSelectedIndex();

			oSmartFilter.setFilterData({
				_CUSTOM: {
					field1: oSelectIndex,
					field2: oSelectViewTypeIndex
				}
			});
		},

		onLoadVariant: function () {
			var oSmartFilter = this.getView().byId("smartFilterBarId"),
				oRadionButtonGrp = this.getView().byId("radioButtonGroupId"),
				oRadionButtonViewTypeGrp = this.getView().byId("radioButtonViewTypeGroupId"),
				oData = oSmartFilter.getFilterData(),
				oCustomFieldData = oData["_CUSTOM"];

			oRadionButtonGrp.setSelectedIndex(oCustomFieldData.field1);
			oRadionButtonViewTypeGrp.setSelectedIndex(oCustomFieldData.field2);
		},

		onBeforeRebindTable: function (oEvent) {
			var oBindingParams = oEvent.getParameter("bindingParams");
			var oSmartTable = oEvent.getSource();
			var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());
			var vDeliveryStatus, vViewType;

			oBindingParams.parameters = oBindingParams.parameters || {};

			if (oSmartFilterBar instanceof sap.ui.comp.smartfilterbar.SmartFilterBar) {
				//Delivery Status Radio Group
				var oCustomControl = oSmartFilterBar.getControlByKey("Wbstk");
				if (oCustomControl instanceof sap.m.RadioButtonGroup) {
					vDeliveryStatus = oCustomControl.getSelectedIndex();
					switch (vDeliveryStatus) {
					case 0:
						oBindingParams.filters.push(new sap.ui.model.Filter("Wbstk", "EQ", "A"));
						oBindingParams.filters.push(new sap.ui.model.Filter("Wbstk", "EQ", "B"));
						break;
					case 1:
						oBindingParams.filters.push(new sap.ui.model.Filter("Wbstk", "EQ", "C"));
						break;
					default:
						break;
					}
				}

				//View Type Radio Group
				var oCustomControl2 = oSmartFilterBar.getControlByKey("ZviewTy");
				if (oCustomControl2 instanceof sap.m.RadioButtonGroup) {
					vViewType = oCustomControl2.getSelectedIndex();
					switch (vViewType) {
					case 0:
						oBindingParams.filters.push(new sap.ui.model.Filter("ZviewTy", "EQ", "0"));
						break;
					case 1:
						oBindingParams.filters.push(new sap.ui.model.Filter("ZviewTy", "EQ", "1"));
						break;
					default:
						break;
					}
				}
			}
		},

		onScanOrderPress: function (oEvent) {
			//Scan order
			sap.ndc.BarcodeScanner.scan(
				function (oResult) {
					var oView = this.getView(),
						oBundle = this.getResourceBundle(),
						oModel = oView.getModel("CustomerDelivery"),
						sKey = "VbelnVa='" + oResult.text + "'";
						
					//Call back end to check if Order has been scanned
					this.setBusyDiaolog(true);
					oModel.read("/ScanClosedSOChkSet(" + sKey + ")", {
						success: function (response) {
							//if Order has been scanned, display message to notify user
							if (response.ZclosedSoFlag === "X") {
								MessageBox.error(oBundle.getText("orderId") + " " + response.VbelnVa + " " + oBundle.getText("hasBeenScanned"));
							} 
							
							//if Order not been scanned, call entityset DeliveryListSet and display scan result
							var oTable = this.getView().byId("tableId"),
								oItemSelectTemplate,
								aFilter = [];
								
							//Set up template
							if (oTable.getBindingInfo("items") !== undefined) {
								oItemSelectTemplate = oTable.getBindingInfo("items").template;
							} else {
								oItemSelectTemplate = new sap.m.ColumnListItem({
									cells: [
								        new sap.m.Text({
								            text: "{VbelnVa}"
								        }),
								        new sap.m.Text({
								            text: "{VbelnVl}"
								        }),
								        new sap.m.Text({
								            text: "{Sort1}"
								        }),
								        new sap.m.Text({
								            text: "{Name1}"
								        }),
								        new sap.m.Text({
								            text: "{Matnr}"
								        }),
								        new sap.m.Text({
								            text: "{ZwbstkTxt}"
								        })
								    ],
								    type: "Navigation",
								    press: this.onItemPress.bind(this)
								});
							}
								
							// Set up filter
							aFilter.push(new Filter("VbelnVa", FilterOperator.EQ, oResult.text));
							aFilter.push(new Filter("Wbstk", FilterOperator.EQ, "A"));
							aFilter.push(new Filter("Wbstk", FilterOperator.EQ, "B"));
		
							//Set up Table Binding Info
							var oBindingInfo = {
								path: "/DeliveryListSet",
								template: oItemSelectTemplate,
								filters: aFilter
							};
		
							//Rebind Table
							oTable.bindAggregation("items", oBindingInfo);

							this.setBusyDiaolog(false);
						}.bind(this),
						error: function (oError) {
							this.setBusyDiaolog(false);
							this.displayServerMessage(oError);
						}.bind(this)
					});
				}.bind(this),
				function (oError) {
					this.displayServerMessage(oError);
				}.bind(this)
			);
		},

		displayServerMessage: function (oMessage) {
			var oBundle = this.getResourceBundle();

			//Display Technical Error
			MessageBox.error(oBundle.getText("technicalError"));
		}
	});
});