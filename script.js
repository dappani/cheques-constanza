
let registros=JSON.parse(localStorage.getItem('chequesRegistrosResponsive')||'[]');
let editando=null;
const clienteInput=document.getElementById('cliente');
const cedulaInput=document.getElementById('cedula');
const btnAgregar=document.getElementById('btnAgregar');
function guardar(){localStorage.setItem('chequesRegistrosResponsive',JSON.stringify(registros))}
function normalizar(t){return(t||'').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function escapeHTML(t){return String(t||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;")}
function renderizar(){
 const tbody=document.getElementById('tabla'); const buscar=normalizar(document.getElementById('buscar').value); tbody.innerHTML='';
 registros.map((item,index)=>({...item,originalIndex:index})).filter(item=>!buscar||normalizar(item.cliente).includes(buscar)||normalizar(item.cedula).includes(buscar)).forEach((item,visibleIndex)=>{
  const tr=document.createElement('tr');
  tr.innerHTML=`<td>${visibleIndex+1}</td><td>${escapeHTML(item.cliente)}</td><td>${escapeHTML(item.cedula||'')}</td><td class="no-print"><div class="action-buttons"><button class="edit" onclick="editar(${item.originalIndex})" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button><button class="delete" onclick="eliminar(${item.originalIndex})" title="Eliminar"><i class="fa-solid fa-trash"></i></button></div></td>`;
  tbody.appendChild(tr);
 });
}
function agregar(){
 const cliente=clienteInput.value.trim().toUpperCase(); const cedula=cedulaInput.value.trim();
 if(!cliente){alert('Escribe el nombre del cliente.');clienteInput.focus();return}
 if(editando!==null){registros[editando]={cliente,cedula}; editando=null; btnAgregar.textContent='Agregar'} else {registros.push({cliente,cedula})}
 guardar(); renderizar(); limpiarFormulario();
}
function editar(index){const item=registros[index];clienteInput.value=item.cliente;cedulaInput.value=item.cedula;editando=index;btnAgregar.textContent='Guardar cambios';clienteInput.focus()}
function eliminar(index){registros.splice(index,1);guardar();renderizar()}
function limpiarFormulario(){clienteInput.value='';cedulaInput.value='';editando=null;btnAgregar.textContent='Agregar';clienteInput.focus()}
function limpiarTodo(){if(confirm('¿Seguro que quieres borrar todos los registros?')){registros=[];guardar();renderizar();limpiarFormulario()}}
function imprimir(){window.print()}
function exportarCSV(){
 let csv='Numero,Cliente,Cedula\n';
 registros.forEach((item,i)=>{csv+=`${i+1},"${(item.cliente||'').replaceAll('"','""')}","${(item.cedula||'').replaceAll('"','""')}"\n`});
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='cheques.csv'; a.click(); URL.revokeObjectURL(url);
 function formatearCedula(input) {

    let valor = input.value.replace(/\D/g, "");

    if (valor.length > 11)
        valor = valor.substring(0,11);

    if (valor.length > 3)
        valor = valor.substring(0,3) + "-" + valor.substring(3);

    if (valor.length > 11)
        valor = valor.substring(0,11) + "-" + valor.substring(11);

    input.value = valor;
}
}
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.activeElement!==document.getElementById('buscar'))agregar()});
renderizar();
