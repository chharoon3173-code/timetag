import { PAYMENT_ACCOUNTS, PAYMENT_WHATSAPP } from '../../data/products.js';

/** A WhatsApp chat link to the payment number (03… becomes 923…), optionally with a message typed in. */
export function paymentWhatsAppLink(message) {
  const number = PAYMENT_WHATSAPP.replace(/\D/g, '').replace(/^0/, '92');
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

/** The accounts customers can pay into (set in src/data/products.js). Used at checkout and on the thank-you page. */
export default function PaymentAccounts() {
  return (
    <div className="co-accounts">
      {PAYMENT_ACCOUNTS.map((account) => (
        <div key={account.name} className="co-account">
          <p className="co-account__name">{account.name}</p>
          <dl className="ty-bank">
            {account.rows.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
