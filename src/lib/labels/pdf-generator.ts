import puppeteer from 'puppeteer'
import { storageService } from '@/lib/storage'
import { generateLabelSheetHTML, LabelData, LabelSheetOptions } from './label-template'
import { generateOrderQRCodes } from './qr-generator'
import { nanoid } from 'nanoid'

export interface PDFGenerationOptions {
  format: 'A4' | 'Letter'
  margin: {
    top: string
    right: string
    bottom: string
    left: string
  }
  printBackground: boolean
  displayHeaderFooter: boolean
  headerTemplate?: string
  footerTemplate?: string
}

export interface LabelGenerationResult {
  pdfPath: string
  signedUrl: string
  fileName: string
}

/**
 * Generate PDF from HTML content using Puppeteer
 */
export async function generatePDFFromHTML(
  html: string,
  options: PDFGenerationOptions = {
    format: 'A4',
    margin: {
      top: '10mm',
      right: '10mm',
      bottom: '10mm',
      left: '10mm',
    },
    printBackground: true,
    displayHeaderFooter: false,
  }
): Promise<Buffer> {
  let browser: puppeteer.Browser | null = null

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
    })

    const page = await browser.newPage()
    
    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    })

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: options.format,
      margin: options.margin,
      printBackground: options.printBackground,
      displayHeaderFooter: options.displayHeaderFooter,
      headerTemplate: options.headerTemplate,
      footerTemplate: options.footerTemplate,
    })

    return pdfBuffer
  } catch (error) {
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

/**
 * Generate label sheet PDF for an order
 */
export async function generateLabelSheetPDF(
  orderData: {
    orderNumber: number
    clientName: string
    garments: Array<{
      id: string
      labelCode: string
      type: string
    }>
    rush: boolean
    createdAt: string
  },
  options: LabelSheetOptions = {
    paperSize: 'A4',
    labelsPerRow: 3,
    labelsPerColumn: 8,
    labelWidth: 70,
    labelHeight: 35,
    margin: 5,
  }
): Promise<LabelGenerationResult> {
  try {
    // Generate QR codes for all garments
    const qrCodes = await generateOrderQRCodes(
      orderData.orderNumber,
      orderData.garments.map(g => ({ id: g.id, labelCode: g.labelCode }))
    )

    // Prepare label data
    const labelData: LabelData = {
      orderNumber: orderData.orderNumber,
      clientName: orderData.clientName,
      clientInitials: getClientInitials(orderData.clientName),
      garments: orderData.garments.map((garment, index) => ({
        ...garment,
        qrCode: qrCodes.garmentQRs[index]?.qrCode || qrCodes.orderQR,
      })),
      rush: orderData.rush,
      createdAt: orderData.createdAt,
      language: orderData.language || 'en',
    }

    // Generate HTML template
    const html = generateLabelSheetHTML(labelData, options)

    // Generate PDF
    const pdfBuffer = await generatePDFFromHTML(html, {
      format: options.paperSize,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
      printBackground: true,
      displayHeaderFooter: false,
    })

    // Generate unique filename
    const fileName = `labels/order-${orderData.orderNumber}-${nanoid(8)}.pdf`
    
    // Upload to storage
    const file = new File([pdfBuffer], fileName, { type: 'application/pdf' })
    
    const uploadResult = await storageService.uploadFile({
      bucket: 'labels',
      path: fileName,
      file,
      options: { upsert: true },
    })

    // Get signed URL
    const signedUrl = await storageService.getSignedUrl({
      bucket: 'labels',
      path: fileName,
      expiresIn: 3600, // 1 hour
    })

    return {
      pdfPath: uploadResult.path,
      signedUrl,
      fileName,
    }
  } catch (error) {
    throw new Error(`Failed to generate label sheet PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate receipt PDF for an order
 */
export async function generateReceiptPDF(
  orderData: {
    orderNumber: number
    clientName: string
    clientEmail?: string
    clientPhone?: string
    garments: Array<{
      type: string
      services: Array<{
        name: string
        quantity: number
        price: number
      }>
    }>
    totals: {
      subtotal_cents: number
      rush_fee_cents: number
      tax_cents: number
      total_cents: number
    }
    rush: boolean
    createdAt: string
    language: 'en' | 'fr'
  }
): Promise<LabelGenerationResult> {
  try {
    // Generate HTML for receipt
    const html = generateReceiptHTML(orderData)

    // Generate PDF
    const pdfBuffer = await generatePDFFromHTML(html, {
      format: 'A4',
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
      printBackground: true,
      displayHeaderFooter: false,
    })

    // Generate unique filename
    const fileName = `docs/receipt-${orderData.orderNumber}-${nanoid(8)}.pdf`
    
    // Upload to storage
    const file = new File([pdfBuffer], fileName, { type: 'application/pdf' })
    
    const uploadResult = await storageService.uploadFile({
      bucket: 'docs',
      path: fileName,
      file,
      options: { upsert: true },
    })

    // Get signed URL
    const signedUrl = await storageService.getSignedUrl({
      bucket: 'docs',
      path: fileName,
      expiresIn: 3600, // 1 hour
    })

    return {
      pdfPath: uploadResult.path,
      signedUrl,
      fileName,
    }
  } catch (error) {
    throw new Error(`Failed to generate receipt PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract client initials from full name
 */
function getClientInitials(clientName: string): string {
  const names = clientName.trim().split(' ')
  if (names.length === 0) return '??'
  
  const firstInitial = names[0]?.[0]?.toUpperCase() || '?'
  const lastInitial = names[names.length - 1]?.[0]?.toUpperCase() || '?'
  
  return `${firstInitial}${lastInitial}`
}

/**
 * Generate HTML for receipt
 */
function generateReceiptHTML(orderData: any): string {
  const isFrench = orderData.language === 'fr'
  
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isFrench ? 'fr-CA' : 'en-US')
  }

  // Localized strings
  const strings = {
    fr: {
      title: 'Reçu',
      order: 'Commande',
      date: 'Date',
      client: 'Client',
      phone: 'Téléphone',
      email: 'Email',
      items: 'Articles',
      subtotal: 'Sous-total',
      rushFee: 'Frais d\'urgence',
      tax: 'Taxe',
      total: 'Total',
      thankYou: 'Merci pour votre commande!',
    },
    en: {
      title: 'Receipt',
      order: 'Order',
      date: 'Date',
      client: 'Client',
      phone: 'Phone',
      email: 'Email',
      items: 'Items',
      subtotal: 'Subtotal',
      rushFee: 'Rush Fee',
      tax: 'Tax',
      total: 'Total',
      thankYou: 'Thank you for your order!',
    },
  }

  const t = strings[orderData.language || 'en']

  return `
<!DOCTYPE html>
<html lang="${orderData.language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t.title} - ${t.order} #${orderData.orderNumber}</title>
    <style>
        ${getReceiptCSS()}
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1>Hotte Couture</h1>
            <h2>${t.title}</h2>
        </div>
        
        <div class="order-info">
            <p><strong>${t.order} #${orderData.orderNumber}</p>
            <p>${t.date}: ${formatDate(orderData.createdAt)}</p>
            <p>${t.client}: ${orderData.clientName}</p>
            ${orderData.clientEmail ? `<p>${t.email}: ${orderData.clientEmail}</p>` : ''}
            ${orderData.clientPhone ? `<p>${t.phone}: ${orderData.clientPhone}</p>` : ''}
        </div>

        <div class="items">
            <h3>${t.items}</h3>
            ${orderData.garments.map((garment: any) => `
                <div class="garment">
                    <h4>${garment.type}</h4>
                    ${garment.services.map((service: any) => `
                        <div class="service">
                            <span>${service.name}</span>
                            <span>${service.quantity}x</span>
                            <span>${formatCurrency(service.price)}</span>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>

        <div class="totals">
            <div class="total-line">
                <span>${t.subtotal}:</span>
                <span>${formatCurrency(orderData.totals.subtotal_cents)}</span>
            </div>
            ${orderData.rush && orderData.totals.rush_fee_cents > 0 ? `
                <div class="total-line">
                    <span>${t.rushFee}:</span>
                    <span>${formatCurrency(orderData.totals.rush_fee_cents)}</span>
                </div>
            ` : ''}
            <div class="total-line">
                <span>${t.tax}:</span>
                <span>${formatCurrency(orderData.totals.tax_cents)}</span>
            </div>
            <div class="total-line total">
                <span>${t.total}:</span>
                <span>${formatCurrency(orderData.totals.total_cents)}</span>
            </div>
        </div>

        <div class="footer">
            <p>${t.thankYou}</p>
        </div>
    </div>
</body>
</html>
`
}

/**
 * Generate CSS for receipt
 */
function getReceiptCSS(): string {
  return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            background: #ff69b4;
            padding: 20px;
        }

        .receipt {
            max-width: 400px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #ff69b4;
            padding-bottom: 20px;
        }

        .header h1 {
            color: #ff69b4;
            font-size: 28px;
            margin-bottom: 5px;
        }

        .header h2 {
            color: #333;
            font-size: 18px;
        }

        .order-info {
            margin-bottom: 25px;
        }

        .order-info p {
            margin-bottom: 5px;
            color: #333;
        }

        .items {
            margin-bottom: 25px;
        }

        .items h3 {
            color: #ff69b4;
            margin-bottom: 15px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
        }

        .garment {
            margin-bottom: 15px;
            padding: 10px;
            background: #f9f9f9;
            border-radius: 5px;
        }

        .garment h4 {
            color: #333;
            margin-bottom: 10px;
        }

        .service {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 14px;
        }

        .totals {
            border-top: 2px solid #ff69b4;
            padding-top: 15px;
            margin-bottom: 25px;
        }

        .total-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 16px;
        }

        .total-line.total {
            font-weight: bold;
            font-size: 18px;
            color: #ff69b4;
            border-top: 1px solid #eee;
            padding-top: 8px;
        }

        .footer {
            text-align: center;
            color: #666;
            font-style: italic;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }

            .receipt {
                box-shadow: none;
                border-radius: 0;
            }
        }
    `
}
