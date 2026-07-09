
let registros = JSON.parse(localStorage.getItem('chequesRegistrosV2') || '[]');
let editando = null;

const clienteInput = document.getElementById('cliente');
const cedulaInput = document.getElementById('cedula');
const btnAgregar = document.getElementById('btnAgregar');

function guardar() {
  localStorage.setItem('chequesRegistrosV2', JSON.stringify(registros));
}

function normalizar(texto) {
  return (texto || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function renderizar() {
  const tbody = document.getElementById('tabla');
  const buscar = normalizar(document.getElementById('buscar').value);
  tbody.innerHTML = '';

  registros
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter(item => {
      if (!buscar) return true;
      return normalizar(item.cliente).includes(buscar) || normalizar(item.cedula).includes(buscar);
    })
    .forEach((item, visibleIndex) => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${visibleIndex + 1}</td>
        <td>${escapeHTML(item.cliente)}</td>
        <td>${escapeHTML(item.cedula || '')}</td>
        <td class="no-print">
    <div class="action-buttons">
        <button class="edit" onclick="editar(${item.originalIndex})" title="Editar">
            <i class="fa-solid fa-pen-to-square"></i>
        </button>

        <button class="delete" onclick="eliminar(${item.originalIndex})" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
        </button>
    </div>
</td>
      `;

      tbody.appendChild(tr);
    });
}

function agregar() {
  const cliente = clienteInput.value.trim().toUpperCase();
  const cedula = cedulaInput.value.trim();

  if (!cliente) {
    alert('Escribe el nombre del cliente.');
    clienteInput.focus();
    return;
  }

  if (editando !== null) {
    registros[editando] = { cliente, cedula };
    editando = null;
    btnAgregar.textContent = 'Agregar';
  } else {
    registros.push({ cliente, cedula });
  }

  guardar();
  renderizar();
  limpiarFormulario();
}

function editar(index) {
  const item = registros[index];
  clienteInput.value = item.cliente;
  cedulaInput.value = item.cedula;
  editando = index;
  btnAgregar.textContent = 'Guardar cambios';
  clienteInput.focus();
}

function eliminar(index) {
  registros.splice(index, 1);
  guardar();
  renderizar();
}

function limpiarFormulario() {
  clienteInput.value = '';
  cedulaInput.value = '';
  editando = null;
  btnAgregar.textContent = 'Agregar';
  clienteInput.focus();
}

function limpiarTodo() {
  if (confirm('¿Seguro que quieres borrar todos los registros?')) {
    registros = [];
    guardar();
    renderizar();
    limpiarFormulario();
  }
}

function imprimir() {
  window.print();
}

function exportarCSV() {
  let csv = 'Numero,Cliente,Cedula\n';
  registros.forEach((item, i) => {
    csv += `${i + 1},"${(item.cliente || '').replaceAll('"', '""')}","${(item.cedula || '').replaceAll('"', '""')}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cheques.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHTML(text) {
  return String(text || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && document.activeElement !== document.getElementById('buscar')) {
    agregar();
  }
});

renderizar();
