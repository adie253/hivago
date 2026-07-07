const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/Aditya/OneDrive/Desktop/Celsys/Hivago/src/presentation/pages/PaymentPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const orderSummaryStart = content.indexOf('{/* Order Summary */}');
const footerSectionStart = content.indexOf('{/* Footer Section */}');

if (orderSummaryStart === -1) {
  console.error("Could not find '{/* Order Summary %}'");
  process.exit(1);
}
if (footerSectionStart === -1) {
  console.error("Could not find '{/* Footer Section %}'");
  process.exit(1);
}

const replacement = `/* Order Details */
                        <div className="flex flex-col gap-3">
                            <h2 className="text-sm font-bold text-gray-900 ml-1">
                                Order Details • {restaurantName?.toUpperCase() || restaurantDetails?.name?.toUpperCase() || 'STAGE'}
                            </h2>
                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
                                
                                {/* Items List */}
                                <div className="flex flex-col gap-3">
                                    {enrichedCartItems.map((item) => (
                                        <div key={\`od-\${item.id}\`} className="flex justify-between items-center text-[15px] font-bold text-gray-800">
                                            <div className="flex items-center">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2.5 shrink-0" />
                                                <span>{item.name} x {item.quantity}</span>
                                            </div>
                                            <span className="text-gray-700 font-bold">₹{Math.round(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-dashed border-gray-200/80 my-1" />

                                {/* Price Breakdown */}
                                <div className="flex flex-col gap-3 text-[14px]">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-medium">Item Total</span>
                                        <span className="text-gray-700 font-bold">₹{cartTotal.toFixed(0)}</span>
                                    </div>

                                    {fulfillmentType !== 'Pickup' && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 font-medium">Delivery Fee</span>
                                            {isCheckingDelivery ? (
                                                <div className="h-4 w-12 bg-gray-100 rounded-full animate-pulse" />
                                            ) : (
                                                <span className="text-gray-700 font-bold">
                                                    {deliveryFee > 0 ? \`₹\${deliveryFee.toFixed(0)}\` : 'FREE'}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {tipAmount > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 font-medium">Delivery Tip</span>
                                            <span className="text-gray-700 font-bold">₹{tipAmount.toFixed(0)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-medium">Platform Charges</span>
                                        <span className="text-gray-700 font-bold">₹{platformFee.toFixed(0)}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-medium">GST and Taxes</span>
                                        <span className="text-gray-700 font-bold">₹{gst.toFixed(0)}</span>
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-gray-200/80 my-1" />

                                {/* Total Paid */}
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-gray-950 font-bold text-base">Total Paid</span>
                                    {isCheckingDelivery ? (
                                        <div className="h-5 w-16 bg-red-100 rounded-full animate-pulse" />
                                    ) : deliveryStatus === 'error' ? (
                                        <span className="text-gray-400 font-bold">--</span>
                                    ) : (
                                        <span className="text-gray-950 font-bold text-[18px]">₹{grandTotal.toFixed(0)}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        `;

const updatedContent = content.substring(0, orderSummaryStart) + replacement + content.substring(footerSectionStart);
fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log("Successfully replaced Order Summary with Order Details block!");
