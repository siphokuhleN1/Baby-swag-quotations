"use client";

import { useMemo, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type Item = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export default function Home() {
  const [isInvoiceMode, setIsInvoiceMode] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerOrg, setCustomerOrg] = useState("");
  const [docCode, setDocCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number | "">(0);
  const [isPdfMode, setIsPdfMode] = useState(false);

  const [date] = useState(
    new Date().toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );

  const signatureDate = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [items, setItems] = useState<Item[]>([]);

  const updatedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        lineTotal: item.quantity * item.unitPrice,
      })),
    [items]
  );

  const subtotal = useMemo(
    () => updatedItems.reduce((sum, item) => sum + item.lineTotal, 0),
    [updatedItems]
  );

  const discountAmount = useMemo(() => {
    const pct = Number(discountPercent) || 0;
    return (subtotal * pct) / 100;
  }, [subtotal, discountPercent]);

  const total = subtotal - discountAmount;

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const deleteItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof Item, value: string) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: field === "description" ? value : Number(value),
      };
      return copy;
    });
  };

  const money = (n: number) =>
    n.toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const docLabel = isInvoiceMode ? "INVOICE" : "QUOTATION";
  const docLabelTitle = isInvoiceMode ? "Invoice" : "Quotation";

  const downloadPDF = async () => {
    const input = document.getElementById("quotation");
    if (!input) return;

    setIsPdfMode(true);
    await new Promise((resolve) => setTimeout(resolve, 150));

    const canvas = await html2canvas(input, {
      scale: 3,
      useCORS: true,
      logging: false,
      windowWidth: input.scrollWidth,
      windowHeight: input.scrollHeight,
    });

    setIsPdfMode(false);

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let remainingHeight = imgHeight;
    let yOffset = 0;

    while (remainingHeight > 0) {
      pdf.addImage(imgData, "PNG", 0, -yOffset, imgWidth, imgHeight);
      remainingHeight -= pageHeight;
      yOffset += pageHeight;
      if (remainingHeight > 0) pdf.addPage();
    }

    pdf.save(`${docLabelTitle}-${docCode || "001"}.pdf`);
  };

  const cellText = "text-sm leading-normal py-[6px]";

  return (
    <main className="min-h-screen bg-[#f4f4f4] py-6">

      {/* ── MODE TOGGLE + DOWNLOAD — outside the captured div ── */}
      <div className="mx-auto mb-4 w-full max-w-[900px] flex items-center justify-between px-1">

        {/* Toggle */}
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${!isInvoiceMode ? "text-[#2f76b6]" : "text-gray-400"}`}>
            Quotation
          </span>
          <button
            onClick={() => setIsInvoiceMode((v) => !v)}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
              isInvoiceMode ? "bg-[#2f76b6]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${
                isInvoiceMode ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-sm font-semibold ${isInvoiceMode ? "text-[#2f76b6]" : "text-gray-400"}`}>
            Invoice
          </span>
        </div>

        {/* Download */}
        <button
          onClick={downloadPDF}
          className="bg-[#2f76b6] px-6 py-2 text-white font-bold shadow hover:bg-[#245e94] transition-colors text-sm"
        >
          ⬇ Download PDF
        </button>
      </div>

      {/* ── DOCUMENT ── */}
      <div
        id="quotation"
        className="mx-auto w-full max-w-[900px] bg-white px-6 py-5 shadow-sm"
      >
        {/* HEADER */}
        <div className="grid grid-cols-[80px_1fr_80px_220px] items-center gap-3">
          <div className="h-[120px] bg-[#2f76b6]" />
          <div className="flex items-center justify-center">
            <img
              src="/logo.jpg"
              alt="Logo"
              className="h-[140px] w-auto object-contain"
            />
          </div>
          <div className="h-[120px] bg-[#2f76b6]" />
          <div className="text-[11px] leading-5">
            <p>941 Dimbaza</p>
            <p>P.O Dimbaza</p>
            <p>5671</p>
            <p>Tel: 0607527341</p>
            <p>Email: babyswagkwt@gmail.com</p>
          </div>
        </div>

        <div className="mt-1 text-center text-[14px] font-bold">
          Registration number (2017 / 523482 / 07)
        </div>

        {/* TITLE BAR */}
        <div className="mt-2 bg-[#2f76b6] py-1 text-center font-bold text-white">
          {docLabel}
        </div>

        {/* CUSTOMER + DETAILS */}
        <div className="mt-3 grid grid-cols-2 gap-6">
          <div>
            <div className="bg-[#2f76b6] px-2 py-1 text-sm font-bold text-white">
              {docLabelTitle} to:
            </div>
            <div className="border p-2 min-h-[64px]">
              {isPdfMode ? (
                <>
                  <div className="text-sm mb-1 min-h-[20px]">{customerName || " "}</div>
                  <div className="text-sm min-h-[20px]">{customerOrg || " "}</div>
                </>
              ) : (
                <>
                  <input
                    placeholder="Customer Name"
                    className="mb-1 w-full outline-none text-sm"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <input
                    placeholder="Organisation"
                    className="w-full outline-none text-sm"
                    value={customerOrg}
                    onChange={(e) => setCustomerOrg(e.target.value)}
                  />
                </>
              )}
            </div>
          </div>

          <div>
            <div className="bg-[#2f76b6] px-2 py-1 text-sm font-bold text-white">
              Details
            </div>
            <div className="border p-2 text-sm min-h-[64px]">
              <p>Date: {date}</p>
              {isPdfMode ? (
                <div className="mt-1 min-h-[20px] text-sm">{docCode || " "}</div>
              ) : (
                <input
                  placeholder={`${docLabelTitle} Code`}
                  className="mt-1 w-full outline-none text-sm"
                  value={docCode}
                  onChange={(e) => setDocCode(e.target.value)}
                />
              )}
              <p>Validity: 30 Days</p>
            </div>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="mt-4 w-full">
          <table className="w-full border-collapse text-sm table-fixed">
            <colgroup>
              <col style={{ width: "70px" }} />
              <col />
              <col style={{ width: "110px" }} />
              <col style={{ width: "130px" }} />
              {!isPdfMode && <col style={{ width: "36px" }} />}
            </colgroup>
            <thead>
              <tr className="bg-[#2f76b6] text-white font-bold">
                <th className="py-2 px-2 text-center">Qty</th>
                <th className="py-2 px-2 text-left">Description</th>
                <th className="py-2 px-2 text-center">Unit Price</th>
                <th className="py-2 px-2 text-right">Total</th>
                {!isPdfMode && <th className="py-2 px-1" />}
              </tr>
            </thead>
            <tbody>
              {updatedItems.length === 0 && (
                <tr>
                  <td
                    colSpan={isPdfMode ? 4 : 5}
                    className="py-6 text-center text-gray-400 text-xs border-b"
                  >
                    No items yet — click "+ Add Item" below.
                  </td>
                </tr>
              )}
              {updatedItems.map((item, index) => (
                <tr key={index} className="border-b align-middle">
                  <td className="px-1">
                    {isPdfMode ? (
                      <div className={`${cellText} text-center`}>{item.quantity}</div>
                    ) : (
                      <input
                        type="number"
                        min={1}
                        className="w-full text-center outline-none bg-transparent py-[6px]"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      />
                    )}
                  </td>

                  <td className="px-2">
                    {isPdfMode ? (
                      <div className={cellText}>{item.description || " "}</div>
                    ) : (
                      <input
                        className="w-full outline-none bg-transparent py-[6px]"
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                      />
                    )}
                  </td>

                  <td className="px-1">
                    {isPdfMode ? (
                      <div className={`${cellText} text-center`}>
                        R {money(item.unitPrice)}
                      </div>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className="w-full text-center outline-none bg-transparent py-[6px]"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                      />
                    )}
                  </td>

                  <td className="px-2">
                    <div className={`${cellText} text-right whitespace-nowrap`}>
                      R {money(item.lineTotal)}
                    </div>
                  </td>

                  {!isPdfMode && (
                    <td className="px-1 text-center">
                      <button
                        onClick={() => deleteItem(index)}
                        className="text-red-500 hover:text-red-700 font-bold text-xs"
                      >
                        ✕
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ADD ITEM */}
        {!isPdfMode && (
          <button
            onClick={addItem}
            className="mt-3 bg-[#2f76b6] px-4 py-2 text-white text-sm font-semibold hover:bg-[#245e94] transition-colors"
          >
            + Add Item
          </button>
        )}

        {/* TOTALS */}
        <div className="mt-4 flex justify-end">
          <div className="w-[260px] text-sm">

            {/* Subtotal — only shown when there's a discount */}
            {(Number(discountPercent) > 0) && (
              <div className="flex justify-between border-t border-gray-200 py-[5px]">
                <span>Subtotal:</span>
                <span>R {money(subtotal)}</span>
              </div>
            )}

            {/* Discount row */}
            <div className="flex justify-between items-center border-t border-gray-200 py-[5px]">
              <span className="flex items-center gap-2">
                Discount:
                {isPdfMode ? (
                  <span className="text-[#2f76b6] font-semibold">
                    {Number(discountPercent) > 0 ? `${discountPercent}%` : "—"}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="1"
                      placeholder="0"
                      className="w-[48px] border border-gray-300 rounded px-1 py-[2px] text-center outline-none text-[#2f76b6] font-semibold"
                      value={discountPercent}
                      onChange={(e) =>
                        setDiscountPercent(
                          e.target.value === "" ? "" : Math.min(100, Number(e.target.value))
                        )
                      }
                    />
                    <span className="text-gray-500">%</span>
                  </span>
                )}
              </span>
              <span className="text-red-600">
                {Number(discountPercent) > 0 ? `− R ${money(discountAmount)}` : "R 0,00"}
              </span>
            </div>

            {/* Total */}
            <div className="flex justify-between border-t border-gray-400 py-[6px] font-bold text-[15px]">
              <span>Total:</span>
              <span>R {money(total)}</span>
            </div>
          </div>
        </div>

        {/* BANKING DETAILS */}
        <div className="mt-4">
          <div className="bg-[#2f76b6] px-2 py-1 font-bold text-white text-sm">
            Banking Details
          </div>
          <div className="border p-2 text-sm leading-6">
            <p>Account Holder: BABY SWAG (PTY) LTD</p>
            <p>Bank: Standard Bank</p>
            <p>Account Number: 300893329</p>
          </div>
        </div>

        {/* SIGNATURE STAMP */}
        <div className="mt-6 flex justify-start">
          <div className="relative" style={{ width: "180px", height: "110px" }}>
            <img
              src="/signature.png"
              alt="Signature Stamp"
              style={{
                width: "180px",
                height: "110px",
                objectFit: "contain",
                display: "block",
              }}
            />
            <span
              style={{
                position: "absolute",
                top: "42%",
                left: "30%",
                fontSize: "9px",
                fontWeight: "600",
                color: "rgb(8, 8, 8)",
                whiteSpace: "nowrap",
              }}
            >
              {signatureDate}
            </span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-5">
          <div className="bg-[#2f76b6] py-1 text-center font-bold text-white text-sm">
            Thank you for your business!
          </div>
          <div className="border px-2 py-3 text-center text-xs leading-5">
            <p>For more information please contact the number below</p>
            <p>
              Tel: 060 752 7341 | E-mail: babyswagkwt@gmail.com | Website:{" "}
              babyswagkwt.wixsite.com/my-site-1
            </p>

            {/* Hidden on Invoice mode */}
            {!isInvoiceMode && (
              <p className="mt-2">
                Kindly note that 50% is required to secure your booking and the
                balance must be paid at least 3 days before the event. N.B. If
                you cancel due to any reason you will forfeit 50% of the money
                you deposited as we have secured this day for you and rejected
                other bookings.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
