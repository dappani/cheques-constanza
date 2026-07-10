
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
}
function formatearCedula(input) {
    // Solo números
    let valor = input.value.replace(/\D/g, "");

    // Máximo 11 dígitos
    valor = valor.substring(0, 11);

    let resultado = "";

    if (valor.length <= 3) {
        resultado = valor;
    } else if (valor.length <= 10) {
        resultado = valor.substring(0, 3) + "-" + valor.substring(3);
    } else {
        resultado =
            valor.substring(0, 3) + "-" +
            valor.substring(3, 10) + "-" +
            valor.substring(10);
    }

    input.value = resultado;
}

async function compartirPDF() {
  const documento = document.querySelector(".sheet");

  if (!documento) {
    alert("No se encontró el documento.");
    return;
  }

  try {
    // Permite que el navegador termine de cargar el logo y las fuentes
    await document.fonts.ready;
   
   document.body.classList.add("modo-pdf");
   
    const canvas = await html2canvas(documento, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false
    });

   document.body.classList.remove("modo-pdf");
   
    const imagen = canvas.toDataURL("image/jpeg", 0.95);

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: "letter"
    });

    const anchoPagina = 8.5;
    const altoPagina = 11;
    const margen = 0.4;

    const anchoDisponible = anchoPagina - margen * 2;
    const altoImagen = canvas.height * anchoDisponible / canvas.width;

    // Si el contenido cabe en una sola página
    if (altoImagen <= altoPagina - margen * 2) {
      const posicionX = (anchoPagina - anchoDisponible) / 2;

      pdf.addImage(
        imagen,
        "JPEG",
        posicionX,
        margen,
        anchoDisponible,
        altoImagen
      );
    } else {
      // Divide automáticamente el contenido en varias páginas
      const altoDisponible = altoPagina - margen * 2;
      const altoCanvasPagina =
        canvas.width * altoDisponible / anchoDisponible;

      let posicionCanvas = 0;
      let pagina = 0;

      while (posicionCanvas < canvas.height) {
        const altoFragmento = Math.min(
          altoCanvasPagina,
          canvas.height - posicionCanvas
        );

        const fragmento = document.createElement("canvas");
        fragmento.width = canvas.width;
        fragmento.height = altoFragmento;

        const contexto = fragmento.getContext("2d");

        contexto.fillStyle = "#ffffff";
        contexto.fillRect(0, 0, fragmento.width, fragmento.height);

        contexto.drawImage(
          canvas,
          0,
          posicionCanvas,
          canvas.width,
          altoFragmento,
          0,
          0,
          canvas.width,
          altoFragmento
        );

        const imagenPagina = fragmento.toDataURL("image/jpeg", 0.95);
        const altoPDF = altoFragmento * anchoDisponible / canvas.width;

        if (pagina > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          imagenPagina,
          "JPEG",
          margen,
          margen,
          anchoDisponible,
          altoPDF
        );

        posicionCanvas += altoFragmento;
        pagina++;
      }
    }

    const archivoPDF = pdf.output("blob");

    const archivo = new File(
      [archivoPDF],
      "cheques-ayuntamiento-esperanza.pdf",
      { type: "application/pdf" }
    );

    const datosCompartir = {
      title: "Cheques - Ayuntamiento de Esperanza",
      text: "Tabla de cheques del Ayuntamiento de Esperanza",
      files: [archivo]
    };

    // Compartir directamente en teléfonos compatibles
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [archivo] })
    ) {
      await navigator.share(datosCompartir);
    } else {
      // Si el navegador no permite compartir archivos, descarga el PDF
      pdf.save("cheques-ayuntamiento-esperanza.pdf");

      alert(
        "Tu navegador no permite compartir el PDF directamente. " +
        "El archivo fue descargado para que puedas compartirlo manualmente."
      );
    }
} catch (error) {
  document.body.classList.remove("modo-pdf");

  if (error.name !== "AbortError") {
    console.error(error);
    alert("No se pudo generar o compartir el PDF.");
  }
}
}

document.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.activeElement!==document.getElementById('buscar'))agregar()});
renderizar();
