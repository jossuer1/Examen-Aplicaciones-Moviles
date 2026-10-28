import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Borrador, BorradorService } from '../../services/borrador';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonIcon,
  IonContent,
  IonList,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonTextarea,
} from '@ionic/angular';
import { UbicacionService, Coordenadas } from '../../services/ubicacion';

import { FotoService } from '../../services/foto';
import { ImagenService } from '../../services/imagen';
import { Clima, ClimaService } from '../../services/clima';
import { IncidenciaService } from '../../services/incidencia';
import { Prioridad, TipoIncidencia } from '../../models/incidencia';

@Component({
  selector: 'app-nueva',
  standalone: true,
  templateUrl: './nueva.page.html',
  styleUrls: ['./nueva.page.scss'],
  imports: [
    IonIcon,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonButton,
    IonTextarea,
  ],
})
export class NuevaPage implements OnInit {
  private borradores = inject(BorradorService);
  private destroyRef = inject(DestroyRef);
  private ubicacion = inject(UbicacionService);
  private fotoService = inject(FotoService);
  private imagenes = inject(ImagenService);
  private climaService = inject(ClimaService);
  private changeDetector = inject(ChangeDetectorRef);
  private incidencias = inject(IncidenciaService);

  form = new FormGroup({
    tipo: new FormControl<TipoIncidencia>('luminaria', { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    direccion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    sector: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    prioridad: new FormControl<Prioridad>('media', { nonNullable: true, validators: [Validators.required] }),
  });
  borradorPendiente: Borrador | null = null;
  cargandoBorrador = true;
  avisoBorrador = '';
  private listoBorrador = false;
  private salio = false;
  private codigoRegistro = `INC-${crypto.randomUUID()}`;
  private fotoSubida = '';
  private climaCoordenadas = '';
  private climaConsultadoEn = 0;

  async ngOnInit() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      void this.persistir();
    });
    await this.ofrecerBorrador();
    if (Capacitor.isNativePlatform()) {
      const listener = await App.addListener('appStateChange', (state) => {
        if (!state.isActive) void this.persistir();
      });
      this.destroyRef.onDestroy(() => {
        void listener.remove();
      });
    }
  }

  async ionViewWillEnter() {
    if (this.salio) {
      this.salio = false;
      await this.ofrecerBorrador();
    }
  }

  ionViewWillLeave() {
    this.salio = true;
    void this.persistir();
  }

  private actualizarVista() {
    if (!this.destroyRef.destroyed) this.changeDetector.detectChanges();
  }

  private async ofrecerBorrador() {
    this.listoBorrador = false;
    this.cargandoBorrador = true;
    try {
      this.borradorPendiente = await this.borradores.leer();
    } catch {
      this.avisoBorrador = 'No se pudo leer el borrador guardado.';
    } finally {
      this.cargandoBorrador = false;
      this.listoBorrador = true;
      this.actualizarVista();
    }
  }

  continuarBorrador() {
    const b = this.borradorPendiente;
    if (!b) return;
    this.form.reset(b.datos, { emitEvent: false });
    this.coords = b.coords;
    this.foto = b.foto;
    this.fotoSubida = b.fotoUrl ?? '';
    this.latTxt = b.latTxt;
    this.lngTxt = b.lngTxt;
    this.mostrarManual = !!(b.latTxt || b.lngTxt);
    this.codigoRegistro = b.codigo;
    this.clima = null;
    this.climaCoordenadas = '';
    this.intentoGuardar = false;
    this.borradorPendiente = null;
    this.avisoBorrador = 'Borrador recuperado. Una foto que no llegó a confirmar la cámara debe tomarse nuevamente.';
  }

  async descartarBorrador() {
    try {
      await this.borradores.borrar();
      this.form.reset(undefined, { emitEvent: false });
      this.coords = null;
      this.foto = null;
      this.fotoSubida = '';
      this.latTxt = '';
      this.lngTxt = '';
      this.clima = null;
      this.climaError = '';
      this.climaCoordenadas = '';
      this.mostrarManual = false;
      this.intentoGuardar = false;
      this.codigoRegistro = `INC-${crypto.randomUUID()}`;
      this.borradorPendiente = null;
      this.avisoBorrador = '';
    } catch {
      this.avisoBorrador = 'No se pudo descartar el borrador. Intenta de nuevo.';
    }
    this.actualizarVista();
  }

  async persistir(forzar = false) {
    if (!this.listoBorrador || this.borradorPendiente || (this.guardando && !forzar)) return;
    const datos = this.form.getRawValue();
    const tieneDatos =
      this.form.dirty ||
      !!(
        datos.descripcion ||
        datos.direccion ||
        datos.sector ||
        this.coords ||
        this.foto ||
        this.latTxt ||
        this.lngTxt
      );
    if (!tieneDatos) return;
    try {
      await this.borradores.guardar({
        version: 1,
        codigo: this.codigoRegistro,
        datos,
        coords: this.coords,
        foto: this.foto,
        fotoUrl: this.fotoSubida,
        latTxt: this.latTxt,
        lngTxt: this.lngTxt,
      });
    } catch {
      this.avisoBorrador =
        'No se pudo guardar el borrador local. Evita cerrar la aplicación hasta guardar el registro.';
      this.actualizarVista();
    }
  }

  intentoGuardar = false;
  guardando = false;
  mensajeGuardado = '';
  errorGuardado = false;

  invalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || this.intentoGuardar);
  }

  async guardar() {
    if (
      this.guardando ||
      this.buscando ||
      this.tomandoFoto ||
      this.consultandoClima ||
      this.cargandoBorrador ||
      this.borradorPendiente
    )
      return;
    this.intentoGuardar = true;
    this.mensajeGuardado = '';
    this.form.markAllAsTouched();
    if (this.form.invalid || this.faltaUbicacion || this.faltaFoto) return;

    this.guardando = true;
    await this.persistir(true);
    this.form.disable({ emitEvent: false });
    this.errorGuardado = false;
    const datos = this.form.getRawValue();
    const coords = this.coords;
    const foto = this.foto;
    let etapa: 'foto' | 'registro' = 'registro';
    try {
      this.mensajeGuardado = foto ? 'Subiendo fotografía...' : 'Registrando incidencia...';
      this.actualizarVista();
      if (
        coords &&
        (this.climaCoordenadas !== `${coords.latitud},${coords.longitud}` ||
          Date.now() - this.climaConsultadoEn > 300000)
      ) {
        this.mensajeGuardado = 'Consultando el clima antes de guardar...';
        this.actualizarVista();
        await this.consultarClima();
      } else if (!coords) {
        this.climaError =
          'Sin coordenadas no se puede consultar el clima. Para este tipo de incidencia la ubicación es opcional.';
      }
      // Si una petición anterior quedó sin respuesta, busca el mismo código antes de crear de nuevo.
      const existente = await firstValueFrom(this.incidencias.getByCodigo(this.codigoRegistro).pipe(timeout(10000)));
      if (existente) {
        this.mensajeGuardado = `La incidencia ${existente.codigo} ya consta en el servicio. No se creó un duplicado.`;
        this.form.reset(undefined, { emitEvent: false });
        this.quitarFoto();
        this.quitarUbicacion();
        this.codigoRegistro = `INC-${crypto.randomUUID()}`;
        await this.borradores.borrar();
        return;
      }
      etapa = foto ? 'foto' : 'registro';
      this.mensajeGuardado = foto ? 'Subiendo fotografía...' : 'Registrando incidencia...';
      this.actualizarVista();
      const fotoUrl = foto
        ? this.fotoSubida || (await firstValueFrom(this.imagenes.subir(foto).pipe(timeout(30000))))
        : '';
      this.fotoSubida = fotoUrl;
      await this.persistir(true);
      etapa = 'registro';
      this.mensajeGuardado = 'Registrando incidencia...';
      this.actualizarVista();
      const creada = await firstValueFrom(
        this.incidencias
          .crear({
            ...datos,
            descripcion: datos.descripcion.trim(),
            direccion: datos.direccion.trim(),
            sector: datos.sector.trim(),
            codigo: this.codigoRegistro,
            fecha: new Date().toISOString(),
            estado: 'pendiente',
            fotoUrl,
            latitud: coords?.latitud ?? null,
            longitud: coords?.longitud ?? null,
            observacion: '',
          })
          .pipe(timeout(20000)),
      );
      this.form.reset(undefined, { emitEvent: false });
      this.quitarFoto();
      this.quitarUbicacion();
      this.latTxt = '';
      this.lngTxt = '';
      this.mostrarManual = false;
      this.mensaje = '';
      this.mensajeFoto = '';
      this.intentoGuardar = false;
      this.mensajeGuardado = `Incidencia ${creada.codigo} registrada correctamente.`;
      this.codigoRegistro = `INC-${crypto.randomUUID()}`;
      await this.borradores.borrar();
    } catch (error: unknown) {
      this.errorGuardado = true;
      const servicio = etapa === 'foto' ? 'Cloudinary (fotografía)' : 'el servicio de incidencias';
      if (error instanceof HttpErrorResponse) {
        const detalle =
          typeof error.error?.error?.message === 'string'
            ? error.error.error.message
            : typeof error.error?.message === 'string'
              ? error.error.message
              : '';
        this.mensajeGuardado =
          error.status === 0
            ? `No se pudo conectar con ${servicio}. Revisa la conexión o el bloqueo del navegador.`
            : `Falló ${servicio} (HTTP ${error.status}). ${detalle}`;
      } else if (error instanceof TimeoutError) {
        this.mensajeGuardado = `Se agotó la espera en ${servicio}.`;
      } else {
        this.mensajeGuardado = `No se pudo completar el guardado en ${servicio}. ${error instanceof Error ? error.message : ''}`;
      }
      this.mensajeGuardado +=
        etapa === 'foto'
          ? ' La incidencia todavía no se envió. Tus datos se conservan.'
          : ' Tus datos se conservan. Comprueba el listado antes de reintentar.';
    } finally {
      this.guardando = false;
      this.form.enable({ emitEvent: false });
      this.actualizarVista();
    }
  }

  clima: Clima | null = null;
  climaError = '';
  consultandoClima = false;

  async consultarClima() {
    if (this.consultandoClima) return;
    this.clima = null;
    this.climaError = '';
    const coords = this.coords;
    if (!coords) {
      this.climaError = 'Obtén tu ubicación o ingresa coordenadas antes de consultar el clima.';
      return;
    }
    this.consultandoClima = true;
    try {
      const resultado = await firstValueFrom(this.climaService.consultar(coords.latitud, coords.longitud));
      if (this.coords === coords) {
        this.clima = resultado;
        this.climaCoordenadas = `${coords.latitud},${coords.longitud}`;
        this.climaConsultadoEn = Date.now();
      }
    } catch (error: unknown) {
      if (this.coords === coords) {
        if (error instanceof TimeoutError) {
          this.climaError = 'La consulta superó los 8 segundos de espera. Reintenta o continúa sin el clima.';
        } else if (error instanceof HttpErrorResponse) {
          this.climaError =
            error.status === 0
              ? 'No se pudo conectar con el servicio de clima. Revisa tu conexión e intenta de nuevo.'
              : `El servicio de clima respondió con error ${error.status}. Intenta más tarde.`;
        } else {
          this.climaError = 'El servicio no devolvió datos de clima completos para esta ubicación.';
        }
      }
    } finally {
      this.consultandoClima = false;
      this.actualizarVista();
    }
  }

  get prioridad(): Prioridad {
    return this.form.controls.prioridad.value;
  }
  foto: string | null = null;
  mensajeFoto = '';
  subiendoPrueba = false;
  urlPrueba = '';

  // La foto es obligatoria solo con prioridad alta
  get faltaFoto(): boolean {
    return this.prioridad === 'alta' && !this.foto;
  }

  tomandoFoto = false;

  async tomarFoto() {
    if (this.tomandoFoto || this.guardando) return;
    this.tomandoFoto = true;
    this.mensajeFoto = '';
    await this.persistir();
    try {
      const r = await this.fotoService.capturar();

      if (r.ok) {
        this.foto = r.dataUrl;
        this.urlPrueba = '';
        this.fotoSubida = '';
        await this.persistir();
        return;
      }
      // Cancelar o fallar no borra nada: ni la foto anterior ni los demás campos
      if (r.motivo === 'denegado') {
        this.mensajeFoto =
          'La aplicación no tiene permiso para usar la cámara. Actívalo en Ajustes del teléfono para tomar la fotografía.' +
          (this.prioridad === 'alta'
            ? ' Con prioridad alta la fotografía es obligatoria, por lo que no podrás guardar el registro sin ella.'
            : '');
      } else if (r.motivo === 'error') {
        this.mensajeFoto = 'No se pudo capturar la fotografía. Intenta de nuevo.';
      }
      // 'cancelado': no se muestra nada, simplemente se sigue como estaba
    } catch {
      this.mensajeFoto = 'No se pudo capturar la fotografía. Intenta de nuevo.';
    } finally {
      this.tomandoFoto = false;
      this.actualizarVista();
    }
  }

  quitarFoto() {
    this.foto = null;
    this.fotoSubida = '';
    void this.persistir();
  }

  probarSubida() {
    if (!this.foto) return;
    this.subiendoPrueba = true;
    this.imagenes.subir(this.foto).subscribe({
      next: (url) => {
        this.urlPrueba = url;
        this.subiendoPrueba = false;
        this.actualizarVista();
      },
      error: () => {
        this.urlPrueba = 'Error al subir';
        this.subiendoPrueba = false;
        this.actualizarVista();
      },
    });
  }
  get tipo(): TipoIncidencia {
    return this.form.controls.tipo.value;
  }
  coords: Coordenadas | null = null;
  buscando = false;
  mensaje = '';
  mostrarManual = false;
  latTxt = '';
  lngTxt = '';

  // Para baches la ubicación es obligatoria
  get faltaUbicacion(): boolean {
    return this.tipo === 'bache' && !this.coords;
  }

  async usarGps() {
    if (this.buscando) return;
    this.buscando = true;
    this.mensaje = '';
    try {
      const r = await this.ubicacion.obtenerActual();
      if (r.ok) {
        this.coords = r.coords;
        this.clima = null;
        this.climaError = '';
        this.mostrarManual = false;
        await this.persistir();
        return;
      }
      this.mostrarManual = true;
      this.mensaje =
        r.motivo === 'denegado'
          ? 'No se concedió el permiso de ubicación. Puedes ingresar las coordenadas manualmente.'
          : r.motivo === 'tiempo_agotado'
            ? 'Se agotó el tiempo de espera de ubicación (15 segundos). Reintenta en un lugar con mejor señal o ingresa las coordenadas manualmente.'
            : 'No se pudo obtener la ubicación. Comprueba que esté activada o ingresa las coordenadas manualmente.';
    } catch {
      this.mostrarManual = true;
      this.mensaje = 'No se pudo obtener la ubicación. Puedes ingresar las coordenadas manualmente.';
    } finally {
      this.buscando = false;
      this.actualizarVista();
    }
  }

  usarManual() {
    const c = this.ubicacion.parsear(this.latTxt, this.lngTxt);
    if (!c) {
      this.mensaje = 'Coordenadas inválidas. La latitud va de -90 a 90 y la longitud de -180 a 180.';
      return;
    }
    this.coords = c;
    this.clima = null;
    this.climaError = '';
    this.mensaje = '';
    void this.persistir();
  }

  quitarUbicacion() {
    this.coords = null;
    this.clima = null;
    this.climaError = '';
    void this.persistir();
  }
}
