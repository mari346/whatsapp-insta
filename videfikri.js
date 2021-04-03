/* eslint-disable no-case-declarations */
const { decryptMedia, vf } = require('@open-wa/wa-automate')
const { color, msgFilter, processTime, isUrl} = require('./function')
const { register } = require('./data/')
const { msg } = require('./msg')
const { downloader, stalker, fun, spammer, education } = require('./lib')
const config = require('./config.json')
const fs = require('fs-extra')
const fetch = require('node-fetch')
const emojiUnicode = require('emoji-unicode')
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')

// eslint-disable-next-line no-undef
         /*=_=_=_=_=_=_=_=_=_=_=_=_=_ MESSAGE HANDLER =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=*/
module.exports = handler = async (vf = new vf(), message) => {
    try {
        const { from, id, type, caption, chat, t, sender, isGroupMsg, isMedia, mimetype, quotedMsg, quotedMsgObj } = message
        let { body } = message
        const { owner, prefix } = config
        const { name, formattedTitle } = chat
        let { pushname, formattedName, verifiedName } = sender
        pushname = pushname || formattedName || verifiedName
        body = (type === 'chat' && body.startsWith(prefix)) ? body : (((type === 'image') && caption) && caption.startsWith(prefix)) ? caption : ''
        
        const chats = (type === 'chat') ? body : ((type === 'image' || type === 'video')) ? caption : ''
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const args = body.trim().split(/ +/).slice(1)
        const ar = args.map((v) => v.toLowerCase())
        const query = args.join(' ')
        const url = args.length !== 0 ? args[0] : ''
        const now = moment(t * 1000).format('DD/MM/YYYY HH:mm:ss')
        const uaOverride = config.uaOverride
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        /*=_=_=_=_=_=_=_=_=_=_=_=_=_ END OF MESSAGE HANDLER =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=*/

        /*=_=_=_=_=_=_=_=_=_=_=_=_=_ DATABASES =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=*/
        const _registered = JSON.parse(fs.readFileSync('./database/registered.json'))
        const _antilink = JSON.parse(fs.readFileSync('./database//antilink.json'))
        const _antivirtext = JSON.parse(fs.readFileSync('./database/antivirtext.json'))
        /*=_=_=_=_=_=_=_=_=_=_=_=_=_ END OF DATABASES =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=*/

        /*=_=_=_=_=_=_=_=_=_=_=_=_=_ VALIDATOR =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=*/
        const botNumber = await vf.getHostNumber() + '@c.us'
        const groupAdmins = isGroupMsg ? await vf.getGroupAdmins(groupId) : ''
        const isGroupAdmins = groupAdmins.includes(sender.id) || false
        const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
        const _registered = JSON.parse(fs.readFileSync('./database/registered.json'))
        const isCmd = body.startsWith(prefix)
        const isOwner = sender.id === owner
        const isRegistered = register.checkRegisteredUser(sender.id, _registered)
        const time = moment(t * 1000).format('DD/MM/YY HH:mm:ss')
        const isImage = type === 'image'
        const isQuotedImage = quotedMsg && quotedMsg.type === 'image'
        const isQuotedVideo = quotedMsg && quotedMsg.type === 'video'
        const isQuotedGif = quotedMsg && quotedMsg.mimetype === 'image/gif'
        const isDetectorOn = isGroupMsg ? _antilink.includes(chat.id) : false
        const isAntiVirtextOn = isGroupMsg ? _antivirtext.includes(chat.id) : false
        /*=_=_=_=_=_=_=_=_=_=_=_=_=_ END OF VALIDATOR =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=*/

        //ANTI-GROUP LINK DETECTOR
        if (isGroupMsg && !isGroupAdmins && isBotGroupAdmins && isDetectorOn && !isOwner) {
            if (chats.match(new RegExp(/(https:\/\/chat.whatsapp.com)/gi))) {
                console.log(color('[KICK]', 'red'), color('Detector Anti Group-Link.', 'água'))
                await vf.reply(from, msg.linkDetected(), id)
                await vf.removeParticipant(groupId, sender.id)
            }
        }

        // ANTI-VIRTEXT
        if (isGroupMsg && isBotGroupAdmins && !isOwner) {
        if (chats.length > 5000) {
            await vf.sendTextWithMentions(from, `Detectou @${sender.id} enviou Virtext\nSerá removido do grupo!`)
            await vf.removeParticipant(groupId, sender.id)
        }
    }

        // Anti-spam
        if (isCmd && msgFilter.isFiltered(from) && !isGroupMsg) return console.log(color('[SPAM]', 'red'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
        if (isCmd && msgFilter.isFiltered(from) && isGroupMsg) return console.log(color('[SPAM]', 'red'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle))

        // Log
        if (isCmd && !isGroupMsg) {
            console.log(color('[CMD]'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))
            await vf.sendSeen(from)
        }
        if (isCmd && isGroupMsg) {
            console.log(color('[CMD]'), color(time, 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle))
            await vf.sendSeen(from)
        }

        switch (command) {
            case 'register': //By: Slavyam
                if (isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                const namaUser = query.substring(0, query.indexOf('|') - 1)
                const umurUser = query.substring(query.lastIndexOf('|') + 2)
                const serialUser = register.createSerial(10)
                register.addRegisteredUser(sender.id, namaUser, umurUser, time, serialUser, _registered)
                await vf.reply(from, `*「 CADASTRO 」*\n\nRegistro com sucesso!\n\n=======================\n➸ *Nome*: ${namaUser}\n➸ *Umur*: ${umurUser}\n➸ *Hora do registro*: ${now}\n➸ *Serial*: ${serialUser}\n=======================`, id)
            break
            case 'antiporn'://PREMIUM
                await vf.reply(from, 'Recurso premium!\nContact: wa.me/558291099267', id)
            break
            /* RANDOM WORDS */
            case 'fakta':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                const datafakta = await axios.get(`https://videfikri.com/api/fakta/`)
                const fakta = datafakta.data.result
                await vf.reply(from, `${fakta.fakta}`, id)
            break
            case 'quotes':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                const dataquotes = await axios.get(`https://videfikri.com/api/randomquotes/`)
                const quotes = dataquotes.data.result
                await vf.reply(from, `➸ *Author*: ${quotes.author}\n➸ *Quotes*: ${quotes.quotes}`, id)
            break
            /* STICKER MAKER */
            case 'takestick':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                    if (quotedMsg && quotedMsg.type == 'sticker') {
                        if (!query.includes('|')) return await vf.reply(from, `Para mudar o adesivo de marca d'água, adesivo de resposta com legenda ${prefix}takestick package_name | author_name\n\nContoh: ${prefix}takestick PUNYA GUA | videfikri`, id)
                        await vf.reply(from, msg.wait(), id)
                        const packnames = query.substring(0, query.indexOf('|') - 1)
                        const authors = query.substring(query.lastIndexOf('|') + 2)
                        const mediaData = await decryptMedia(quotedMsg)
                        const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                        await vf.sendImageAsSticker(from, imageBase64, { author: `${authors}`, pack: `${packnames}` })
                        .catch(async (err) => {
                            console.error(err)
                            await vf.reply(from, 'Error!', id)
                        })
                    } else {
                        await vf.reply(from, `Responda ao adesivo que deseja incluir com uma legenda ${prefix}takestick package_name | author_name\n\nContoh: ${prefix}takestick tem uma caverna | videfikri`, id)
                    }
        break
            case 'sgifwm':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                if (isMedia && type === 'video' || mimetype === 'image/gif') {
                    if (!query.includes('|')) return await vf.reply(from, `Para criar uma marca d'água stickergif\nUsar ${prefix}sgifwm author | packname`, id)
                    const namaPacksgif = query.substring(0, query.indexOf('|') - 1)
                    const authorPacksgif = query.substring(query.lastIndexOf('|') + 2)
                    await vf.reply(from, msg.wait(), id)
                    try {
                        const mediaData = await decryptMedia(message, uaOverride)
                        const videoBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                        await vf.sendMp4AsSticker(from, videoBase64, { fps: 10, startTime: `00:00:00.0`, endTime : `00:00:06.0`, loop: 0 }, { author: `${authorPacksgif}`, pack: `${namaPacksgif}`, keepScale: true })
                            .then(async () => {
                                console.log(`Adesivo processado para ${processTime(t, moment())} seconds`)
                                
                            })
                    } catch (err) {
                        console.error(err)
                        await vf.reply(from, `O tamanho do vídeo é muito grande\nO tamanho máximo é 1 MB!`, id)
                    }
                } else if (isQuotedGif || isQuotedVideo) {
                    const namaPacksgif = query.substring(0, query.indexOf('|') - 1)
                    const authorPacksgif = query.substring(query.lastIndexOf('|') + 2)
                    await vf.reply(from, msg.wait(), id)
                    try {
                        const mediaData = await decryptMedia(quotedMsg, uaOverride)
                        const videoBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                        await vf.sendMp4AsSticker(from, videoBase64, { fps: 10, startTime: `00:00:00.0`, endTime : `00:00:06.0`, loop: 0 }, { author: `${authorPacksgif}`, pack: `${namaPacksgif}`, crop: false })
                            .then(async () => {
                                console.log(`Adesivo processado para ${processTime(t, moment())} seconds`)
                                
                            })
                    } catch (err) {
                        console.error(err)
                        await vf.reply(from, `O tamanho do vídeo é muito grande\nO tamanho máximo é 1 MB!`, id)
                    }
                } else {
                    await vf.reply(from, `Para fazer stickergif com marca d'água\nUsar ${prefix}autor sgifwm | packname`, id)
                }
            break
            case 'stickernocrop':
            case 'stnc':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                if (isMedia && isImage || isQuotedImage) {
                    try {
                    await vf.reply(from, msg.wait(), id)
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                    const mediaData = await decryptMedia(encryptMedia, uaOverride)
                    const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                    await vf.sendImageAsSticker(from, imageBase64, { keepScale: true, author: '@figurinhas_whatsapp', pack: 'siga no Instagram' })
                    console.log(`Adesivo processado para ${processTime(t, moment())} seconds`)
                } catch (err) {
                    console.error(err)
                    await vf.reply(from, 'Error!', id)
                }
            } else {
                await vf.reply(from, `Para fazer um adesivo sem corte\nsilahkan *upload* ou responder foto com legenda ${prefix}stnc`, id)
            }
            break
            case 'sticker':
            case 'stiker':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                if (isMedia && isImage || isQuotedImage) {
                    try {
                    await vf.reply(from, msg.wait(), id)
                    const encryptMedia = isQuotedImage ? quotedMsg : message
                    const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                    const mediaData = await decryptMedia(encryptMedia, uaOverride)
                    const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                    await vf.sendImageAsSticker(from, imageBase64, { author: '@figurinhas_whatsapp', pack: 'siga no Instagram' })
                    console.log(`Sticker processed for ${processTime(t, moment())} seconds`)
                } catch (err) {
                    console.error(err)
                    await vf.reply(from, 'Error!', id)
                }
            } else {
                await vf.reply(from, `Para fazer um adesivo\n* carregue * ou responda a foto com legenda ${prefix}sticker`, id)
            }
            break
            case 'stickergif':
            case 'stikergif':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                if (isMedia && type === 'video' || mimetype === 'image/gif') {
                    await vf.reply(from, msg.wait(), id)
                    try {
                        const mediaData = await decryptMedia(message, uaOverride)
                        const videoBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                        await vf.sendMp4AsSticker(from, videoBase64, { fps: 10, startTime: `00:00:00.0`, endTime : `00:00:06.0`, loop: 0 }, { author: '@figurinhas_whatsapp', pack: 'siga no Instagram' })
                            .then(async () => {
                                console.log(`Adesivo processado para ${processTime(t, moment())} segundos`)
                                
                            })
                    } catch (err) {
                        console.error(err)
                        await vf.reply(from, `O tamanho do vídeo é muito grande\nO tamanho máximo é 1 MB!`, id)
                    }
                } else if (isQuotedGif || isQuotedVideo) {
                    await vf.reply(from, msg.wait(), id)
                    try {
                        const mediaData = await decryptMedia(quotedMsg, uaOverride)
                        const videoBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                        await vf.sendMp4AsSticker(from, videoBase64, { fps: 10, startTime: `00:00:00.0`, endTime : `00:00:06.0`, loop: 0 }, { author: '@figurinhas_whatsapp', pack: 'siga no Instagram' })
                            .then(async () => {
                                console.log(`Adesivo processado para ${processTime(t, moment())} segundos`)
                                
                            })
                    } catch (err) {
                        console.error(err)
                        await vf.reply(from, `O tamanho do vídeo é muito grande\nO tamanho máximo é 1 MB!`, id)
                    }
                } else {
                    await vf.reply(from, `Para converter GIF/Os vídeos ficam fixos, envie vídeos/gif com legenda ${prefix}stikergif`, id)
                }
            break
            /* END OF STICKER MAKER */

            /* DOWNLOADER */
            case 'play':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                if (!query) return await vf.reply(from, `Para tocar música do YouTube\nUsar ${prefix}play título_música\n\nExemplo: ${prefix}play martin garrix`, id)
                await vf.reply(from, msg.wait(), id)
                downloader.ytPlay(query)
                .then(async ({result}) => {
                    const { title, channel, duration, id, thumbnail, views, size, url, description, published_on } = await result
                    if (Number(size.split('MB')[0]) >= 20.00) {
                        await vf.sendFileFromUrl(from, thumbnail, 'thumbnail.jpg', `➸ *Título*: ${title}\n➸ *ID*: ${id}\n➸ *Tamanho*: ${size}\n\nFracassado, o tamanho máximo é *20MB*!\nFaça o download você mesmo através do URL abaixo:\n${url}`, id)
                    } else {
                        await vf.sendFileFromUrl(from, thumbnail, 'thumbnail.jpg', `➸ *Título*: ${title}\n➸ *Canal*: ${channel}\n➸ *ID*: ${id}\n➸ *Views*: ${views}\n➸ *Duração*: ${duration}\n➸ *Tamanho*: ${size}\n➸ *Publicado em*: ${published_on}\n➸ *Descrição*: ${description}`, id)
                        const downl = await fetch(url);
                        const buffer = await downl.buffer(); 
                        await fs.writeFile(`./temp/audio/${sender.id}.mp3`, buffer)
                        await vf.sendFile(from, `./temp/audio/${sender.id}.mp3`, 'audio.mp3', '', id)
                        console.log('Sucesso ao enviar Play MP3!')
                        fs.unlinkSync(`./temp/audio/${sender.id}.mp3`)
                    }
                }) 
                .catch(async (err) => {
                    console.error(err)
                    await vf.reply(from, 'Error!', id)
                })
                break
                case 'igtv':
                    if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                    if (!query) return await vf.reply(from, `Formato incorreto!\npara baixar Instagram TV\nUsar ${prefix}igtv link_igtv`, id)
                    await vf.reply(from, msg.wait(), id)
                    downloader.igtv(query)
                    .then(async ({result}) => {
                        const { username, thumb, full_name, video_url, duration, caption, comment, likes } = aguardar resultado
                        await vf.sendFileFromUrl(from, thumb, 'thumbnail.jpg', `➸ *Username*: ${username}\n➸ *Full Name*: ${full_name}\n➸ *Duração*: ${duration}\n➸ *Caption*: ${caption}\n➸ *Comente*: ${comment}\n➸ *Likes*: ${likes}`, id)
                        await vf.sendFileFromUrl(from, video_url, 'igtv.mp4', '', id)
                    }) 
                    .catch(async (err) => {
                        console.error(err)
                        await vf.reply(from, 'Error!', id)
                    })
                break
                case 'ytmp3':
                    if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                    if (!query) return await vf.reply(from, `Formato incorreto!\para baixar o YouTube para MP3\nUsar ${prefix}ytmp3 link_video`, id)
                    await vf.reply(from, msg.wait(), id)
                    downloader.ytmp3(query)
                    .then(async ({result}) => {
                        const { judul, size, thumbnail, id, url, extension, source } = await result
                        if (Number(size.split(' MB')[0]) >= 20.00) {
                            await vf.sendFileFromUrl(from, thumbnail, 'thumbnail.jpg', `➸ *Título*: ${judul}\n➸ *ID*: ${id}\n➸ *Tamanho*: ${size}\n\nFracassado, o tamanho máximo é *20MB*!\nFaça o download você mesmo através do URL abaixo:\n${url}`, id)
                        } else {
                        await vf.sendFileFromUrl(from, thumbnail, 'thumbnail.jpg', `➸ *Título*: ${judul}\n➸ *Tamanho*: ${size}\n➸ *ID*: ${id}\n➸ *Extensão*: ${extension}\n➸ *Source*: ${source}\n\nSendo enviado, seja paciente...`, id)
                        await vf.sendFileFromUrl(from, url, 'ytmp3.mp3', '', id)
                        }
                    }) 
                    .catch(async (err) => {
                        console.error(err)
                        await vf.reply(from, 'Error!', id)
                    })
                break
                case 'ytmp4':
                    if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                    if (!query) return await vf.reply(from, `Formato incorreto!\npara baixar o YouTube para MP4\nUsar ${prefix}ytmp4 link_video`, id)
                    await vf.reply(from, msg.wait(), id)
                    downloader.ytmp4(query)
                    .then(async ({result}) => {
                        const { judul, id, source, imgUrl, urlVideo } = aguardar resultado
                        await vf.sendFileFromUrl(from, imgUrl, 'thumbnail.jpg', `➸ *Título*: ${judul}\n➸ *ID*: ${id}\n➸ *Fonte*: ${source}\n\nSendo enviado, seja paciente...`, id)
                        await vf.sendFileFromUrl(from, urlVideo, 'ytmp3.mp3', '', id)
                    }) 
                    .catch(async (err) => {
                        console.error(err)
                        await vf.reply(from, 'Error!', id)
                    })
                break
                /* END OF DOWNLOADER */

                /* STALKER */
                case 'igstalk':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                if (!query) return await vf.reply(from, `Formato incorreto!\npara perseguir a conta do Instagram de alguém, use ${prefix}nome de usuário stalkig\n\nExemplo: ${prefix}perseguindo videfikri`, id)
                await vf.reply(from, msg.wait(), id)
                stalker.instagram(query)
                .then(async ({result}) => {
                    const { full_name, username, bio, followers, following, post_count, profile_hd, is_verified, is_private, external_url, fbid, show_suggested_profile } = await result
                    await vf.sendFileFromUrl(from, profile_hd, 'ProfileIgStalker.jpg', `➸ *Username*: ${username}\n *Full Name*: ${full_name}\n➸ *Biography*: ${bio}\n➸ *Followers*: ${followers}\n➸ *Following*: ${following}\n➸ *Post*: ${post_count}\n➸ *Is_Verified*: ${is_verified}\n➸ *Is_Private*: ${is_private}\n➸ *External URL*: ${external_url}\n➸ *FB ID*: ${fbid}\n➸ *Show Suggestion*: ${show_suggested_profile}`, id)
                }) 
                .catch(async (err) => {
                    console.error(err)
                    await vf.reply(from, 'Error!', id)
                })
            break
            case 'twtprof':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                if (!query) return await vf.reply(from, `Format salah!\nuntuk meng-stalk akun Twitter seseorang\ngunakan ${prefix}twtprof username`, id)
                await vf.reply(from, msg.wait(), id)
                stalker.twitter(query)
                .then(async ({result}) => {
                    const { full_name, username, followers, following, tweets, profile, verified, listed_count, favourites, joined_on, profile_banner } = await result
                    await vf.sendFileFromUrl(from, profile, 'ProfileTwitter.jpg', `➸ *Username*: ${username}\n *Full Name*: ${full_name}\n➸ *Followers*: ${followers}\n➸ *Following*: ${following}\n➸ *Tweet*: ${tweets}\n➸ *Is_Verified*: ${verified}\n➸ *Favourites*: ${favourites}\n➸ *Listed Count*: ${listed_count}\n➸ *Joined On*: ${joined_on}\n➸ *Profile Banner*: ${profile_banner}`, id)
                })
                .catch(async (err) => {
                    console.error(err)
                    await vf.reply(from, 'Error!', id)
                })
            break
            case 'github':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                if (!query) return await vf.reply(from, `Formato incorreto!\para perseguir uma conta Github\nUsar ${prefix}github username`, id)
                await vf.reply(from, msg.wait(), id)
                stalker.github(query)
                .then(async ({result}) => {
                    const { username, id, profile_pic, fullname, company, blog, location, email, hireable, biografi, public_repository, public_gists, followers, following, joined_on, last_updated, profile_url} = await result
                    await vf.sendFileFromUrl(from, profile_pic, 'ProfileGithub.jpg', `➸ *Username*: ${username}\n➸ *Full Name*: ${fullname}\n➸ *ID*: ${id}\n➸ *Company*: ${company}\n➸ *Blog*: ${blog}\n➸ *Location*: ${location}\n➸ *Email*: ${email}\n➸ *Hireable*: ${hireable}\n➸ *Biography*: ${biografi}\n➸ *Public Repository*: ${public_repository}\n➸ *Public Gists*: ${public_gists}\n➸ *Followers*: ${followers}\n➸ *Following*: ${following}\n➸ *Joined On*: ${joined_on}\n➸ *Last Updated*: ${last_updated}\n➸ *Profile URL*: ${profile_url}`, id)
                })
                .catch(async (err) => {
                    console.error(err)
                    await vf.reply(from, 'Error!', id)
                })
            break
            /* END OF STALKER */

            /* FUN MENU */
            case 'simi':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                if (!query) return await vf.reply(from, `Usar ${prefix}simi teks`, id)
                fun.simsimi(query)
                .then(async ({result}) => {
                    await vf.reply(from, result.jawaban, id)
                })
                .catch(async (err) => {
                    console.error(err)
                    await vf.reply(from, 'Error!', id)
                })
            break
            case 'balikhuruf':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                if (!query) return await vf.reply(from, `Para reverter uma carta\nUsar ${prefix}texto reverso`, id)
                fun.balikhuruf(query)
                .then(async ({result}) => {
                    await vf.reply(from, result.kata, id)
                })
                .catch(async (err) => {
                    console.error(err)
                    await vf.reply(from, 'Error!', id)
                })
            break
            case 'hitunghuruf':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                if (!query) return await vf.reply(from, `Para contar o número de letras\nUsar ${prefix}conte as letras do texto`, id)
                fun.hitunghuruf(query)
                .then(async ({result}) => {
                    await vf.reply(from, result.jumlah, id)
                })
                .catch(async (err) => {
                    console.error(err)
                    await vf.reply(from, 'Error!', id)
                })
            break
            case 'hilih':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                if (!query) return await vf.reply(from, `Para selecionar o texto\nUsar ${prefix}selecionar texto\n\nExemplo: ${prefix}escolha halah Muito falando`, id)
                fun.hilihteks(query)
                .then(async ({result}) => {
                    await vf.reply(from, result.kata, id)
                })
                .catch(async (err) => {
                    console.error(err)
                    await vf.reply(from, 'Error!', id)
                })
            break
            /* END OF FUN MENU */
            
            /* SPAMMER */
            case 'email':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                if (!query.includes('|')) return await vf.reply(from, `Para enviar um e-mail para alguém\nUsar ${prefix}alvo de e-mail | sujeito | mensagem`, id)
                const target = query.substring(0, query.indexOf('|') - 1)
                const subjek = query.substring(query.indexOf('|') + 2, query.lastIndexOf('|') - 1)
                const pesan = query.substring(query.lastIndexOf('|') + 2)
                spammer.email(target, subjek, pesan)
                .then(async ({result}) => {
                    await vf.reply(from, result.log_lengkap, id)
                })
                .catch(async (err) => {
                    console.error(err)
                    await vf.reply(from, 'Error!', id)
                })
            break
            case 'call':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                if (!query) return await vf.reply(from, `Para enviar uma chamada para alguém\nUsar ${prefix}ligar numero_phone`, id)
                spammer.call(query)
                .then(async ({result}) => {
                    await vf.reply(from, result.logs, id)
                })
                .catch(async (err) => {
                    console.error(err)
                    await vf.reply(from, 'Error!', id)
                })
            break
            /* END OF SPAMMER */

            /* EDUCATION */
            case 'covidindo':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                await vf.reply(from, msg.wait(), id)
                .then(async ({result}) => {
                    await vf.reply(from, `➸ *País*: ${result.country}\n➸ *Positivo*: ${result.positif}\n➸ *Negativo*: ${result.negatif}\n➸ *Morreu*: ${result.meinggal}\n➸ *Ser curado*: ${result.sembuh}\n➸ *No cuidado*: ${result.dalam_perawatan}`, id)
                })
                .catch(async (err) => {
                    console.error(err)
                    await vf.reply(from, 'Error!', id)
                })
            break
            case 'kbbi':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                if (!query) return await vf.reply(from, `Para encontrar a palavra KBBI\nUsar ${prefix}consulta kbbi\n\nExemplo: ${prefix}kbbi manusia`, id)
                await vf.reply(from, msg.wait(), id)
                education.kbbi(query)
                .then(async ({result}) => {
                    await vf.reply(from, `➸ *Título*: ${result.judul}\n➸ *PageID*: ${result.pageid}\n➸ *Conteúdo do Conteúdo*: ${result.isi_konten}`, id)
                })
                .catch(async (err) => {
                    console.error(err)
                    await vf.reply(from, 'Error!', id)
                })
            break
            case 'wiki':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                if (!query) return await vf.reply(from, `Para pesquisar Wikipediaq\nUsar ${prefix}consulta wiki\n\nExemplo: ${prefix}wiki indonesia`, id)
                await vf.reply(from, msg.wait(), id)
                education.wikipedia(query)
                .then(async ({result}) => {
                    await vf.reply(from, `➸ *Título*: ${result.judul}\n➸ *PageID*: ${result.pageid}\n➸ *Conteúdo do Conteúdo*: ${result.isi_konten}`, id)
                })
                .catch(async (err) => {
                    console.error(err)
                    await vf.reply(from, 'Error!', id)
                })
            break
            case 'wikien':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                if (!query) return await vf.reply(from, `Para pesquisar a Wikipedia em inglês\nUsar ${prefix}consulta wikien\n\nContoh: ${prefix}wikien indonesia`, id)
                await vf.reply(from, msg.wait(), id)
                education.wikipediaen(query)
                .then(async ({result}) => {
                    await vf.reply(from, `➸ *Título*: ${result.judul}\n➸ *PageID*: ${result.pageid}\n➸ *Contente*: ${result.desc}`, id)
                })
                .catch(async (err) => {
                    console.error(err)
                    await vf.reply(from, 'Error!', id)
                })
            break
            /* END OF EDUCATION */

            /* MODERATIOR CMDS */
            case 'antilink':
                if (!isGroupMsg) return await vf.reply(from, msg.groupOnly(), id)
                if (!isGroupAdmins) return await vf.reply(from, msg.adminOnly(), id)
                if (!isBotGroupAdmins) return await vf.reply(from, msg.botNotAdmin(), id)
                if (ar[0] === 'on') {
                    if (isDetectorOn) return await vf.reply(from, `Falha, o anti-link de grupo foi ativado antes`, id)
                    _antilink.push(groupId)
                    fs.writeFileSync('./database/antilink.json', JSON.stringify(_antilink))
                    await vf.reply(from, `*...:* *ANTI GROUP LINK*\n\nAtenção aos membros do grupo ${(name || formattedTitle)}\nEste grupo instalou anti-link, se você enviar outro link de grupo, ele será clicado automaticamente!`, id)
                } else if (ar[0] === 'off') {
                    _antilink.splice(groupId, 1)
                    fs.writeFileSync('./database/antilink.json', JSON.stringify(_antilink))
                    await vf.reply(from, `Anti-link desativado com sucesso`, id)
                } else {
                    await vf.reply(from, `Para proteger este grupo de outros links de grupo\ntipo ${prefix}antilink on --habilitar\n${prefix}antilink off --desabilitar`, id)
                }
            break
            case 'antivirtext':
                if (!isGroupMsg) return await vf.reply(from, msg.groupOnly(), id)
                if (!isGroupAdmins) return await vf.reply(from, msg.adminOnly(), id)
                if (!isBotGroupAdmins) return await vf.reply(from, msg.botNotAdmin(), id)
                if (ar[0] === 'on') {
                    if (isAntiVirtextOn) return await vf.reply(from, `Fracassado, Anti Virtext foi ativado antes`, id)
                    _antivirtext.push(groupId)
                    fs.writeFileSync('./database/antivirtext.json', JSON.stringify(_antivirtext))
                    await vf.reply(from, `*...:* *ANTI VIRTEXT*\n\nAtenção aos membros do grupo ${(name || formattedTitle)}\nEste grupo foi instalado anti-virtext, se você enviar virtext, ele irá clicar automaticamente!`, id)
                } else if (ar[0] === 'off') {
                    _antivirtext.splice(groupId, 1)
                    fs.writeFileSync('./database/antivirtext.json', JSON.stringify(_antivirtext))
                    await vf.reply(from, `Anti-virtext desativado com sucesso`, id)
                } else {
                    await vf.reply(from, `Para proteger este grupo de virtext\ntipo ${prefix}antivirtext on --habilitar\n${prefix}antivirtext off --desabilitar`, id)
                }
            break
            /* END OF MODERATION CMDS */

            /* OTHERS */
            case 'emot':
                if (!isRegistered) return await vf.reply(from, msg.notRegistered(pushname), id)
                if (!query) return await vf.reply(from, `Formato incorreto!\nto converter emoji em adesivo\nUsar ${prefix}Emoji_nya emotiva`, id)
                try {
                await vf.reply(from, msg.wait(), id)
                const emoji = emojiUnicode(query)
                await vf.sendImageAsSticker(from, await vf.download(`https://videfikri.com/api/emojitopng/?emojicode=${emoji}`), { author: '@figurinhas_whatsapp', pack: 'siga no Instagram' })
                } catch (err) {
                    console.error(err)
                    await vf.reply(from, 'Error!', id)
                }
            break
            /* END OF OTHERS */

            case 'menuadmin':
                if (isGroupMsg && isGroupAdmins) {
                await vf.reply(from, msg.menuAdmin(), id)
                }
            break
            case 'menu':
            case 'help':
                await vf.reply(from, msg.menu(pushname), id)
                .then(() => ((isGroupMsg) && (isGroupAdmins)) ? vf.sendText(from, `Menu de administração do grupo: *${prefix}menuadmin*`) : null)
            break
        }
    } catch (err) {
        console.error(err)
    }
}
