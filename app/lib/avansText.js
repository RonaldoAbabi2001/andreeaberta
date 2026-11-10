// Textele pentru avans, aceleasi in SMS (server) si in WhatsApp (butonul din admin).
// p = programarea { nume, data, ora, pret, avans_suma }; sumaLasata = cat a dat clienta (optional).

export function sumaAvansImplicita(pret) {
  return Math.ceil((Number(pret) || 0) / 2)
}

export function textAvans(tip, p, sumaLasata) {
  const prenume = String(p?.nume || '').trim().split(/\s+/)[0] || 'draga'
  const pret = Number(p?.pret) || 0
  const ora = p?.ora ? `, ora ${p.ora}` : ''
  if (tip === 'confirmare') {
    const suma = sumaLasata != null && sumaLasata !== ''
      ? Number(sumaLasata) || 0
      : p?.avans_suma != null ? Number(p.avans_suma) : sumaAvansImplicita(pret)
    const rest = Math.max(0, pret - suma)
    return `Buna ${prenume}! Am primit avansul de ${suma} lei. Programarea ta din ${p?.data || ''}${ora} este confirmata.` +
      (rest > 0 ? ` Rest de plata la salon: ${rest} lei.` : '') + ' Te asteptam! EVOLIS'
  }
  const suma = sumaAvansImplicita(pret)
  return `Buna ${prenume}! Iti reamintim ca programarea ta din ${p?.data || ''}${ora} devine ferma dupa achitarea avansului` +
    (suma > 0 ? ` de ${suma} lei` : '') + ', numerar la salon sau cu cardul. Pentru detalii: 0793 234 142. Multumim! EVOLIS'
}
