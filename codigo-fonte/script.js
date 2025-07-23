// Array e contador 
let tarefas = [];
let contadorId = 0;
let historicoTarefas = [];


// DOM
const form = document.getElementById('tarefaForm');
const lista = document.getElementById('listaTarefas');
const inputNome = document.getElementById('nomeTarefa');
const selectPrioridade = document.getElementById('prioridadeTarefa');
const inputData = document.getElementById('dataTarefa');
const inputHora = document.getElementById('horaTarefa');


// notificacao lateral pg
function mostrarNotificacao(mensagem, tipo, callbackCentral = null) {
  const notificacao = document.createElement('div');
  notificacao.className = `notificacao ${tipo}`;
  notificacao.textContent = mensagem;
  document.body.appendChild(notificacao);


  setTimeout(() => {
    notificacao.style.opacity = '0';
    setTimeout(() => {
      notificacao.remove();
      if (callbackCentral) callbackCentral();
    }, 300);
  }, 2000);
}


// notificacao central pg
function mostrarNotificacaoCentral(mensagem) {
  const central = document.createElement('div');
  central.className = 'popup-central';
  central.innerText = mensagem;
  document.body.appendChild(central);

  setTimeout(() => {
    central.style.opacity = '0';
    setTimeout(() => central.remove(), 300);
  }, 3000);
}


// obter data e hora real
const obterDataHora = () => {
  const agora = new Date();
  return agora.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour12: false
  });
};


// elemento visual da tarefa
function criarTarefaElemento(tarefa) {
  const item = document.createElement('li');
  item.className = `tarefa ${tarefa.prioridade}`;
  item.dataset.id = tarefa.id;

  if (tarefa.concluida) item.classList.add('concluida');

  const conteudo = document.createElement('div');
  conteudo.textContent = `${tarefa.nome} — ${tarefa.agendamento}`;

  const infoData = document.createElement('small');
  infoData.textContent = tarefa.data;

  const botoes = document.createElement('div');
  botoes.className = 'btn';


  // botao concluir
  const btnConcluir = document.createElement('button');
  btnConcluir.className = 'marcar';
  btnConcluir.textContent = tarefa.concluida ? 'Desfazer' : 'Concluir';
  btnConcluir.addEventListener('click', () => toggleConcluida(tarefa.id));


  // botao editar
  const btnEditar = document.createElement('button');
  btnEditar.textContent = 'Editar';
  btnEditar.style.backgroundColor = 'orange';
  btnEditar.addEventListener('click', () => editarTarefa(tarefa.id));


  // botao remover
  const btnRemover = document.createElement('button');
  btnRemover.className = 'remover';
  btnRemover.textContent = 'Remover';
  btnRemover.addEventListener('click', () => removerTarefa(tarefa.id));

  botoes.appendChild(btnConcluir);
  botoes.appendChild(btnEditar);
  botoes.appendChild(btnRemover);

  item.appendChild(conteudo);
  item.appendChild(infoData);
  item.appendChild(botoes);

  return item;
}


// atualiza lista de tarefas
function atualizarLista() {
  lista.innerHTML = '';
  tarefas.forEach(tarefa => {
    lista.appendChild(criarTarefaElemento(tarefa));
  });
}


// atualiza o historico
function atualizarVisualizacaoHistorico() {
  const container = document.getElementById('historicoVisual');
  container.innerHTML = '';

  const ultimas = historicoTarefas.slice(-3).reverse();

  ultimas.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.nome}</strong> — ${item.status}<br><small>${item.data}</small>`;
    container.appendChild(li);
  });
}


// add tarefa
function adicionarTarefa(event) {
  event.preventDefault();

  const nome = inputNome.value.trim();
  const prioridade = selectPrioridade.value;
  const dataSelecionada = inputData.value;
  const horaSelecionada = inputHora.value;

  if (!nome || !prioridade || !dataSelecionada || !horaSelecionada) {
    mostrarNotificacao('Preencha todos os campos corretamente!', 'erro');
    return;
  }

  const agendamento = `Agendada para: ${dataSelecionada.split('-').reverse().join('/')} às ${horaSelecionada}`;

  const novaTarefa = {
    id: contadorId++,
    nome,
    prioridade,
    concluida: false,
    data: `Adicionada em: ${obterDataHora()} — ${agendamento}`,
    agendamento
  };

  tarefas.push(novaTarefa);
  atualizarLista();

  historicoTarefas.push({
    nome: novaTarefa.nome,
    status: 'Pendente',
    data: obterDataHora()
  });
  atualizarVisualizacaoHistorico();

  mostrarNotificacao(
    'Tarefa Adicionada com Sucesso!',
    'sucesso',
    () => mostrarNotificacaoCentral(`"${nome}" - ${agendamento}`)
  );

  form.reset();
}


// alterna a tarefa concluida
function toggleConcluida(id) {
  const tarefa = tarefas.find(t => t.id === id);
  if (tarefa) {
    tarefa.concluida = !tarefa.concluida;
    tarefa.data = `${tarefa.concluida ? 'Concluída' : 'Reativada'} em: ${obterDataHora()}`;
    atualizarLista();

    historicoTarefas.push({
      nome: tarefa.nome,
      status: tarefa.concluida ? 'Concluída' : 'Pendente',
      data: obterDataHora()
    });
    atualizarVisualizacaoHistorico();

    mostrarNotificacao(
      `Tarefa ${tarefa.concluida ? 'concluída' : 'reativada'}!`,
      'sucesso',
      () => mostrarNotificacaoCentral(`Tarefa "${tarefa.nome}" ${tarefa.concluida ? 'concluída' : 'reativada'} em: ${obterDataHora()}`)
    );
  }
}


// editar tarefa
function editarTarefa(id) {
  const tarefa = tarefas.find(t => t.id === id);
  if (tarefa) {
    const novoNome = prompt('Editar nome da tarefa:', tarefa.nome);
    const novaPrioridade = prompt('Editar prioridade (baixa, media, alta, urgente):', tarefa.prioridade);

    if (novoNome && novaPrioridade) {
      tarefa.nome = novoNome.trim();
      tarefa.prioridade = novaPrioridade.trim().toLowerCase();
      tarefa.data = `Editada em: ${obterDataHora()} — ${tarefa.agendamento}`;
      atualizarLista();

      historicoTarefas.push({
        nome: tarefa.nome,
        status: tarefa.concluida ? 'Concluída' : 'Pendente',
        data: obterDataHora()
      });
      atualizarVisualizacaoHistorico();

      mostrarNotificacao(
        'Tarefa Editada com Sucesso!',
        'sucesso',
        () => mostrarNotificacaoCentral(`Tarefa "${tarefa.nome}" editada em: ${obterDataHora()}`)
      );
    }
  }
}


// remove tarefa
function removerTarefa(id) {
  const indice = tarefas.findIndex(t => t.id === id);
  if (indice !== -1) {
    const [removida] = tarefas.splice(indice, 1);
    atualizarLista();

    historicoTarefas.push({
      nome: removida.nome,
      status: 'Removida',
      data: obterDataHora()
    });
    atualizarVisualizacaoHistorico();

    mostrarNotificacao(
      'Tarefa Removida com Sucesso!',
      'sucesso',
      () => mostrarNotificacaoCentral(`Tarefa "${removida.nome}" removida em: ${obterDataHora()}`)
    );
  }
}


// botao visualizar historico
document.getElementById('btnVisualizarHistorico').addEventListener('click', () => {
  const lista = document.getElementById('historicoVisual');
  lista.style.display = lista.style.display === 'none' || !lista.style.display ? 'block' : 'none';
});


// inicia o form
form.addEventListener('submit', adicionarTarefa);
atualizarLista();
atualizarVisualizacaoHistorico();
