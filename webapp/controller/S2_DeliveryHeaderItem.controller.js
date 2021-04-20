sap.ui.define([
	"sdu001/ZSDAPP_SCAN_CUST_DEL_CENTR_WH_BR/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ndc/BarcodeScanner",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel"
], function (BaseController, Filter, FilterOperator, FilterType, BarcodeScanner, MessageBox, JSONModel, ResourceModel) {
	"use strict";

	return BaseController.extend("sdu001.ZSDAPP_SCAN_CUST_DEL_CENTR_WH_BR.controller.S2_DeliveryHeaderItem", {
		onInit: function () {
			var oRouter,
				oTarget;

			oRouter = this.getRouter();
			oTarget = oRouter.getTarget("S2_DeliveryHeaderItem");
			oTarget.attachDisplay(function (oEvent) {
				var bSerialNumFlag,
					bMoreTrackFlag,
					oView = this.getView();

				//store the data
				this._oData = oEvent.getParameter("data");

				//Set selected on section 1
				this.getView().byId("section1").focus();

				//Load system date into Goods Issue Date
				this.onLoadSystemDate();
				
				//Populate value into header part
				oView.byId("gwsNoSlipNumberTextId").setText(this._oData.VbelnVa);
				oView.byId("salesOrderTextId").setText(this._oData.VbelnS4);
				oView.byId("deliveryTextId").setText(this._oData.VbelnVl);
				oView.byId("locationOfTheProductTextId").setText(this._oData.Lgobe);
				oView.byId("customerCodeTextId").setText(this._oData.Sort1);
				oView.byId("customerNameTextId").setText(this._oData.Name1);

				//Rebind table before set visible/invisible
				this.onRebindTable();
				
				//Store Mtart and Matkl as global variable to be use later
				this._mtart = this._oData.Mtart;
				this._matkl = this._oData.Matkl;

				//Check scenario to visible/invisible serial number and more tracking number
				switch (this._mtart) {
				case "ZMCH":
					bSerialNumFlag = true;
					bMoreTrackFlag = false;
					break;
				case "ZUKN":
					if (this._matkl === "UKON") {
                        bSerialNumFlag = false;
                        bMoreTrackFlag = true;
					} else {
                        bSerialNumFlag = false;
                        bMoreTrackFlag = false;
					}
					break;
				case "ZFIL":
					bSerialNumFlag = false;
					bMoreTrackFlag = true;
					break;
				case "ZSUP":
					bSerialNumFlag = false;
					bMoreTrackFlag = true;
					break;
				case "ZNPS":
					bSerialNumFlag = false;
					bMoreTrackFlag = true;
					break;
				default:
					break;
				}

				//Set visible/invisible for serial number and more tracking number
				oView.byId("serialNumberId").setVisible(bSerialNumFlag);
				oView.byId("serialNumberLabelId").setVisible(bSerialNumFlag);
				oView.byId("serialNumberButtonId").setVisible(bSerialNumFlag);
				oView.byId("addTrackingNumberLabelId").setVisible(bMoreTrackFlag);
				oView.byId("addTrackingNumberButtonId").setVisible(bMoreTrackFlag);
				oView.byId("trackingNumberTableId").setVisible(bMoreTrackFlag);

				//Set Delivery Status Text
				oView.byId("overallDeliveryStatusTextId").setText(this._oData.ZwbstkTxt);
			}, this);
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

		onRebindTable: function () {
			var oTable = this.getView().byId("tableId"),
				oItemSelectTemplate = oTable.getBindingInfo("items").template,
				aFilter = new Filter("Vbeln", FilterOperator.EQ, this._oData.VbelnVl),
				aFilters = new Filter({
					filters: [aFilter]
				});

			//Set up Table Binding Info
			var oBindingInfo = {
				path: "/DeliveryItemSet",
				template: oItemSelectTemplate,
				filters: [aFilters]
			};

			//Rebind Table
			oTable.bindAggregation("items", oBindingInfo);
		},

		onNavBack: function () {
			var oView = this.getView(),
				oTable = oView.byId("tableId"),
				oMoreTrackingNumberTable = oView.byId("trackingNumberTableId"),
				oTrackingNumber = oView.byId("trackingNumberId");

			//Initialize header information for tracking number when navigate back
			oTrackingNumber.setValue("");

			//Destroy more tracking number when navigate back
			oMoreTrackingNumberTable.destroyItems();

			//Destroy item table information when navigate back
			oTable.destroyItems();

			//In some cases we could display a certain target when the back button is pressed
			if (this._oData) {
				this.getView().getModel().refresh();
				this.getRouter().getTargets().display(this._oData.fromTarget);
				delete this._oData;
				
				//Set selected on section 1											
				this.getView().byId("section1").focus();

				return;
			}
		},

		onTrackingNumberPress: function (oEvent) {
			var oView = this.getView();

			//Scan Tracking Number
			sap.ndc.BarcodeScanner.scan(
				function (oResult) {
					oView.byId("trackingNumberId").setValue(oResult.text);
				}.bind(this),
				function (oError) {
					this.displayServerMessage(oError);
				}.bind(this)
			);
		},

		onSerialNumberPress: function (oEvent) {
			var oView = this.getView(),
				sSerialNumBtn = oView.byId("serialNumberButtonId").getId(),
				sSerialNumId = oView.byId("serialNumberId").getId(),
				sTableId = oView.byId("tableId").getId();

			var sButtonId = oEvent.getSource().getId(),
				sSeq = sButtonId.split(
					sSerialNumBtn + "-" + sTableId + "-"
				),
				sInputId = sSerialNumId + "-" + sTableId + "-" + sSeq[1],
				that = sInputId;

			//Scan Serial Number
			sap.ndc.BarcodeScanner.scan(
				function (oResult) {
					oView.byId(that).setValue(oResult.text);
					oView.byId(that).fireChange();
				}.bind(this),
				function (oError) {
					this.displayServerMessage(oError);
				}.bind(this)
			);
		},

		onChangeSerialNumber: function (oEvent) {
			var oSerialNo = oEvent.getSource(),
				sSerialNoValue = oSerialNo.getValue(),
				oView = this.getView(),
				oBundle = this.getResourceBundle(),
				oModel = oView.getModel("CustomerDelivery");

			//Translate Serial Number to uppercase
			sSerialNoValue = sSerialNoValue.toUpperCase();
			oSerialNo.setValue(sSerialNoValue);

			//Validate serial number value from back end
			if (sSerialNoValue !== "") {
				var sSerialNumId = oView.byId("serialNumberId").getId(),
					sTableId = oView.byId("tableId").getId(),
					sLineItemId = oView.byId("posnrTextId").getId(),
					sSerialNumberSeqId = oEvent.getSource().getId();
				var sSeq = sSerialNumberSeqId.split(
					sSerialNumId + "-" + sTableId + "-"
				);
				var sLineItemSeqId = sLineItemId + "-" + sTableId + "-" + sSeq[1];
				var sVbelnVl = this._oData.VbelnVl,
					sPosnr = oView.byId(sLineItemSeqId).getProperty("text").substring(9),
					sKey = "Sernr='" + sSerialNoValue + "',VbelnVl='" + sVbelnVl + "',Posnr='" + sPosnr + "'";

				//Call back end to validate serial number
				this.setBusyDiaolog(true);
				oModel.read("/SerialNumValidationSet(" + sKey + ")", {
					success: function (response) {
						if (response.Zstatus === "X1") {
							MessageBox.error(oBundle.getText("serialNumber") + " " + response.Sernr + " " + oBundle.getText("andMaterial") + " " +
								response.Matnr + " " + oBundle.getText("doesNotMatch"));
							oSerialNo.setValue("");
						} else if (response.Zstatus === "X2") {
							MessageBox.error(oBundle.getText("stockDataOfSerialNumber") + " " + response.Sernr + " " + oBundle.getText(
								"notSuitableForMovement"));
							oSerialNo.setValue("");
						}
						this.setBusyDiaolog(false);
					}.bind(this),
					error: function (oError) {
						this.setBusyDiaolog(false);
						this.displayServerMessage(oError);
					}.bind(this)
				});
			}
		},

		onAddTrackingNumberPress: function (oEvent) {
			var oView = this.getView(),
				oTable = oView.byId("trackingNumberTableId"),
				oBundle = this.getResourceBundle();

			//Create Vbox
			var oVbox = new sap.m.VBox({
				width: "100%"
			});

			//Create Tracking Number Input
			var oInput = new sap.m.Input({
				width: "200px",
				editable: false
				// editable: true
			});

			//Create Scan Tracking Number Button
			var oButton = new sap.m.Button({
				text: oBundle.getText("scanTrackingNumber"),
				type: "Emphasized",
				width: "200px",
				press: function (oPressEvent) {
					var oPressInput = oPressEvent.getSource().getParent().getItems()[0];

					//Scan More Tracking Number
					sap.ndc.BarcodeScanner.scan(
						function (oResult) {
							oPressInput.setValue(oResult.text);
						}.bind(this),
						function (oError) {
							this.displayServerMessage(oError);
						}.bind(this)
					);
				}.bind(this)
			});

			//Add input and button into Vbox
			oVbox.addItem(oInput);
			oVbox.addItem(oButton);

			//Create Column List Item
			var oItem = new sap.m.ColumnListItem({
				cells: [oVbox]
			});

			//Add Column List Item into Table
			oTable.addItem(oItem);
		},

		onDelete: function (oEvent) {
			var oTable = this.getView().byId("trackingNumberTableId");

			//Remove More Tracking Number
			oTable.removeItem(oEvent.getParameter("listItem"));
		},

		onPostPgi: function (oEvent) {
			var oView = this.getView(),
				oModel = this.getView().getModel("CustomerDelivery"),
				sDeliveryNum = oView.byId("deliveryTextId").getText(),
				sTrackingNum = oView.byId("trackingNumberId").getValue(),
				oTable = oView.byId("tableId"),
				aTableItems = oTable.getItems(),
				sTableItemsLength = aTableItems.length,
				aHeaderItem = [],
				oTrackTable = oView.byId("trackingNumberTableId"),
				oTrackTableItems = oTrackTable.getItems(),
				sTableTrackItemsLength = oTrackTableItems.length,
				aHeaderTrack = [],
				oBundle = this.getResourceBundle(),
				oDatePicker = oView.byId("goodsIssueDateId"),
				i,
				j,
				k,
				l,
				m,
				n;

			//Mandatory Check for Goods Issue Date
			if (oDatePicker.getDateValue() === null) {
				oDatePicker.setValueState("Error");
				MessageBox.error(oBundle.getText("goodsIssueDateError"));
				return;
			} else {
				oDatePicker.setValueState("None");
			}

			//Get Serial Number
			for (i = 0; i < sTableItemsLength; i++) {
				var oCells = aTableItems[i].getAggregation("cells"),
					oCellsLength = oCells.length;
				for (j = 0; j < oCellsLength; j++) {
					var oVboxItems = oCells[j].getAggregation("items"),
						oVboxItemsLength = oVboxItems.length,
						sSerialNumber = "",
						sPosnr = "";
					for (k = 0; k < oVboxItemsLength; k++) {
						var sVboxItemId = oVboxItems[k].getId(),
							sSerialNumId = oView.byId("serialNumberId").getId(),
							sTableId = oView.byId("tableId").getId(),
							sLineItemId = oView.byId("posnrTextId").getId(),
							sPosnrId = sLineItemId + "-" + sTableId + "-" + i;

						//Item number
						if (sVboxItemId === sPosnrId) {
							sPosnr = oVboxItems[k].getProperty("text").substring(9);
						}

						//Serial number
						if (this._mtart === "ZMCH") {
							var sSerialNumberId = sSerialNumId + "-" + sTableId + "-" + i;
							if (sVboxItemId === sSerialNumberId) {
								sSerialNumber = oVboxItems[k].getProperty("value");
							}
						}
					}

					//push headeritem data into array
					if (this._mtart === "ZMCH") {
						aHeaderItem.push({
							"VbelnVl": sDeliveryNum,
							"Posnr": sPosnr,
							"Sernr": sSerialNumber
						});
					} else {
						aHeaderItem.push({
							"VbelnVl": sDeliveryNum,
							"Posnr": sPosnr
						});
					}

					break;
				}
			}

			//Get more Tracking Number
			for (l = 0; l < sTableTrackItemsLength; l++) {
				var oTrackCells = oTrackTableItems[l].getAggregation("cells"),
					oTrackCellsLength = oTrackCells.length;
				for (m = 0; m < oTrackCellsLength; m++) {
					var oTrackVboxItems = oTrackCells[m].getAggregation("items"),
						oTrackVboxItemsLength = oTrackVboxItems.length;
					for (n = 0; n < oTrackVboxItemsLength; n++) {
						var sTrackVboxItemId = oTrackVboxItems[n].getId();
						if (sTrackVboxItemId.substring(0, 7) === "__input") {
							var sTrackingNumber = oTrackVboxItems[0].getProperty("value");
							aHeaderTrack.push({
								"VbelnVl": sDeliveryNum,
								"ZtrackNumber": sTrackingNumber
							});
						}
					}
				}
			}
			
			//Set up post content
			var oPostContent = {
				"VbelnVl": sDeliveryNum,
				"ZtrackNumber": sTrackingNum,
				"Mtart": this._mtart,
				"Matkl": this._matkl,
				"WadatIst": this.changeDateToUTC(oDatePicker.getDateValue()),
				"HeaderTrack": aHeaderTrack,
				"HeaderItem": aHeaderItem
			};

			//Post PGI
			this.setBusyDiaolog(true);
			oModel.create("/PgiHeaderSet", oPostContent, {
				method: "POST",
				success: function (response) {
					//Update Delivery Status
					oView.byId("overallDeliveryStatusTextId").setText(response.ZwbstkTxt);

					//Display post message
					if (response.ZerrFlag === "") {
						MessageBox.success(response.Zmsg);
					} else {
						MessageBox.error(response.Zmsg);
					}
					this.setBusyDiaolog(false);
				}.bind(this),
				error: function (oError) {
					this.setBusyDiaolog(false);
					this.displayServerMessage(oError);
				}.bind(this)
			});
		},

		displayServerMessage: function (oMessage) {
			var oBundle = this.getResourceBundle();

			//Display Technical Error
			MessageBox.error(oBundle.getText("technicalError"));
		},
		
		onLoadSystemDate: function () {
			var oDatePicker = this.getView().byId("goodsIssueDateId");
			
			oDatePicker.setDateValue(new Date());
			
			//Code below is to disable manual typing date
			// oDatePicker.addEventDelegate({
			// 	onAfterRendering: function () {
			// 		var oDateInner = this.$().find('.sapMInputBaseInner');
			// 		var oID = oDateInner[0].id;
			// 		$('#' + oID).attr("disabled", "disabled");
			// 	}
			// }, oDatePicker);
		},

		changeDateToUTC: function (oDate) { 
			//Change the date to UTC, so it will ignore timezone
			var oTempDate = new Date(oDate.setHours("00", "00", "00", "00"));
			oDate = new Date(oTempDate.getTime() + oTempDate.getTimezoneOffset() * (-60000));
			return oDate;
		}
	});
});