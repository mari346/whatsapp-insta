Vide Fikri Botquire('fs-extra')
const { prefix } = JSON.parse(fs.readFileSync('config.json'))

exports.notRegistered = (pushname) => {
    return `Olá ${pushname}\nVocê ainda não está cadastrado no banco de dados\ntipo ${prefix}registre-se para registrar`
}

exports.wait = () => {
    return 'Por favor espere um momento...'
}

exports.linkDetected = () => {
    return `*...:* *ANTILINK GRUPO*\n\nVocê foi detectado enviando outro link de grupo\nVocê será clicado automaticamente!`
}

exports.groupOnly = () => {
    return `Este comando só pode ser usado dentro de grupos!`
}

exports.botNotAdmin = () => {
    return `Faça do bot um administrador primeiro!`
}

exports.adminOnly = () => {
    return `Este comando só pode ser usado por administradores de grupo!`
}

exports.menu = (pushname) => {
    return `
╠══★〘 FIGURINHAS_WHATSAPP 〙★══
║
╠☞ Nome: *${pushname}*
║
║★══★══★══★══★══★

╔══★〘 DOWNLOADER 〙★══
║
╠☞ *${prefix}igtv*
╠☞ *${prefix}play*
╠☞ *${prefix}ytmp3*
╠☞ *${prefix}ytmp4*
║
╠══★〘 STALKER 〙★══
║
╠☞ *${prefix}igstalk*
╠☞ *${prefix}twtprof*
╠☞ *${prefix}github*
║
╠══★〘 STICKER 〙★══
║
╠☞ *${prefix}sticker*
╠☞ *${prefix}stickergif*
╠☞ *${prefix}sgifwm*
╠☞ *${prefix}takestick*
╠☞ *${prefix}emot*
║
╠══★〘 DIVERSÃO 〙★══
║
╠☞ *${prefix}simi*
╠☞ *${prefix}hilih*
╠☞ *${prefix}balikhuruf*
╠☞ *${prefix}hitunghuruf*
║
╠══★〘 EDUCAÇÃO 〙★══
║
╠☞ *${prefix}wiki*
╠☞ *${prefix}wikien*
╠☞ *${prefix}kbbi*
╠☞ *${prefix}covidindo*
║
╠══★〘 SPAMMER 〙★══
║
╠☞ *${prefix}email*
╠☞ *${prefix}call*
║
╠══★〘 ALEATÓRIA 〙★══
║
╠☞ *${prefix}fakta*
╠☞ *${prefix}quotes*
║
║══★〘 SIGA NO INSTAGRAM 〙★══
`
}
exports.menuAdmin = () => {
    return `
*...:* *ADMIN MENU* *:...   
-❁ *${prefix}antilink*
-❁ *${prefix}antivirtext*
`
}
