/*Entrado na sala bonus */
/*Entrar na sala*/
const user = {
    from: "",
    to: "Todos",
    text: "",
    type: "message"
}

function nomeUser() {
    user.from = document.querySelector('.login input').value;

    if(user.from.length > 0){

        userAtivo = {
            name: user.from
        }

        carregando()
        const volta = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', userAtivo);
        volta.then(novoUser);
        volta.catch(userExite);

    }else{
        alert('Seu nome não pode ser em branco')
    }

    setInterval(verificarStatus, 5000)
}

function novoUser() {

    
    buscarMsg();
    buscarUsuarios()

    setTimeout( removerTela , 2000 )
    setInterval(buscarUsuarios, 20000)
    setInterval(buscarMsg, 3000)
    
}

function carregando(){
    const tela = document.querySelector('.login div')
    tela.innerHTML = `<img class="spinner" src="img/loading-buffering.gif" alt="espiral">
    <p class="spinnerText">Entrando...</p>`
}

function removerTela(){
    const login = document.querySelector('.login')
    login.classList.remove('login')
}

function userExite(erro) {
    alert('Erro ' + erro.request.status + " Usuario já exite")
    window.location.reload()
}


/** Manter conexão*/

function verificar(resposta) {
    console.log('staus: ' + resposta.data);
}

function semUsuario(){
    window.location.reload()
}

function verificarStatus() {

    const status = axios.post('https://mock-api.driven.com.br/api/v6/uol/status', userAtivo);
    status.then(verificar);
    status.catch(semUsuario)

}

/**Buscar Mensagens */

function buscarMsg() {
    const retorno = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    retorno.then(carregarMsg);
    retorno.catch(userExite);

}

function carregarMsg(msgServidor) {
    let messagesRecebidas = msgServidor.data
    montandoMsg(messagesRecebidas)

}

function montandoMsg(msg) {
    const msgs = document.querySelector('.todasMensagens');
    msgs.innerHTML = '';
    for (let i = 0; i < msg.length; i++) {
        if (msg[i].from.length > 8) {
            msg[i].from = msg[i].from.slice(0, 10);
        }

        if (msg[i].type == 'status') {
            msgs.innerHTML += `<div class="entrou-sala">
            <span><span class="time">(${msg[i].time})</span>  <span class="user">${msg[i].from}</span> para <span class="destino">${msg[i].to}:</span>  ${msg[i].text}</span>
            </div>`

        } else if (msg[i].type == "message") {
            msgs.innerHTML += `<div class="envio-msg">
            <span><span class="time">(${msg[i].time})</span>  <span class="user">${msg[i].from}</span> para <span class="destino">${msg[i].to}:</span>  ${msg[i].text}</span>
            </div>`
            
        } else if (msg[i].type === 'private_message' && (msg[i].to === user.from || msg[i].from === user.from)) {
            msgs.innerHTML += `<div class="direct">
            <span><span class="time">(${msg[i].time})</span>  <span class="user">${msg[i].from}</span> para <span class="destino">${msg[i].to}:</span>  ${msg[i].text}</span>
            </div>`
        }


    }
    msgs.innerHTML += `<span id="final"><span>`;

    const ultimoElemento = document.querySelector('#final');
    ultimoElemento.scrollIntoView();
}




/* Buscar Usuarios*/

function buscarUsuarios() {
    const retornoUser = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
    retornoUser.then(carregarUser)
    retornoUser.catch(userExite)
}

function carregarUser(usuariosAtivos) {

    const ativos = usuariosAtivos.data;
    const ativoSidebar = document.querySelector('.usuariosAtivos');

    ativoSidebar.innerHTML = '';
    ativoSidebar.innerHTML = `<span onclick="destinatario(this)">
                                <ion-icon name="person-circle-outline"></ion-icon>
                                <p>Todos</p>
                                <ion-icon id="name" name="chevron-down-outline" class="escolha escolhafinal" data-name="Todos"></ion-icon>
                             </span>`
    for (let i = 0; i < ativos.length; i++) {
        ativoSidebar.innerHTML += `<span onclick="destinatario(this)">
                                        <ion-icon name="person-circle-outline"></ion-icon>
                                        <p data-identifier="participant">${ativos[i].name}</p>
                                        <ion-icon id="name" name="chevron-down-outline" class="escolha" data-name="${ativos[i].name}"></ion-icon>
                                    </span>`
    }

    visibilidade()
}



/**/

/** Enviar mensagens*/

/*bonus*/
const newMsg = document.querySelector('.enviar > div input');
newMsg.addEventListener('keydown', (event) => {
    if(event.key === 'Enter'){
        enviarNewMsg()
    }
})

function enviarNewMsg() {
    user.text = newMsg.value

    const promesseEvio = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', user);
    promesseEvio.then(buscarMsg)

    newMsg.value = '';
}


/*abri sidebar*/

function abriBar() {
    let bar = document.querySelector('.sidebar')
    bar.classList.remove('invisivel')
}

function fechaBar() {
    let bar = document.querySelector('.sidebar')
    bar.classList.add('invisivel')
}

/*Escolher o destinatario*/

function destinatario(destino) {

    const usuarios = document.querySelectorAll('.usuariosAtivos .escolhafinal')
    usuarios.forEach((usuario) => {
        usuario.classList.remove('escolhafinal')
    })

    const destinado = destino.querySelector('.usuariosAtivos :last-child:last-Child')
    const classes = destinado.classList
    classes.add('escolhafinal')

    visibilidade()

}


function visibilidade() {
    const destinatarioFinal = document.querySelector('.usuariosAtivos .escolhafinal')
    const publico = document.querySelector('#publico');
    const privado = document.querySelector('#reservado');

    const subtextoEnviar = document.querySelector('.enviar  div  span')

    if (destinatarioFinal.dataset.name !== 'Todos') {
        publico.classList.remove('escolhafinal');
        privado.classList.add('escolhafinal');
        user.to = destinatarioFinal.dataset.name;
        user.type = "private_message";
        subtextoEnviar.innerHTML = `Enviando para <span>${user.to}</span> (<span>reservadademente</span>)`

    } else {
        publico.classList.add('escolhafinal');  
        privado.classList.remove('escolhafinal');
        user.to = 'Todos'
        user.type = "message";
        subtextoEnviar.innerHTML = `Enviando para <span>Todos</span> (<span>publico</span>)`
    }


}

