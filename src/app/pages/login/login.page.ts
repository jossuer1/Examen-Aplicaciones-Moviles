import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import type { FormGroup} from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  AlertController,
  ToastController,
} from '@ionic/angular';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonIcon,
    IonSpinner,
    IonSegment,
    IonSegmentButton,
    IonLabel,
  ],
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  readonly modo = signal<'login' | 'registro'>('login');
  readonly cargando = signal<boolean>(false);
  readonly mostrarPassword = signal<boolean>(false);
  readonly mensajeError = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    nombre: [''],
  });

  get emailInvalido(): boolean {
    const control = this.form.get('email');
    return !!(control && control.touched && control.invalid);
  }

  get passwordInvalido(): boolean {
    const control = this.form.get('password');
    return !!(control && control.touched && control.invalid);
  }

  cambiarModo(nuevoModo: 'login' | 'registro'): void {
    this.modo.set(nuevoModo);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);
    const nombreControl = this.form.get('nombre');
    if (nuevoModo === 'registro') {
      nombreControl?.setValidators([Validators.required, Validators.minLength(2)]);
    } else {
      nombreControl?.clearValidators();
    }
    nombreControl?.updateValueAndValidity();
  }

  alternarVerPassword(): void {
    this.mostrarPassword.update((val) => !val);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mensajeError.set('Por favor completa todos los campos requeridos correctamente.');
      return;
    }

    const { email, password, nombre } = this.form.value;
    this.cargando.set(true);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);

    try {
      if (this.modo() === 'login') {
        await this.auth.login(email, password);
        await this.mostrarToast('¡Bienvenido a UrbanInspect!', 'success');
      } else {
        await this.auth.register(email, password, nombre);
        await this.mostrarToast('Cuenta creada con éxito en Firebase. ¡Bienvenido!', 'success');
      }

      await this.router.navigate(['/tabs/inicio'], { replaceUrl: true });
    } catch (err) {
      const errorMsg = this.auth.formatFirebaseError(err);
      this.mensajeError.set(errorMsg);
    } finally {
      this.cargando.set(false);
    }
  }

  async ingresarModoDemo(): Promise<void> {
    this.cargando.set(true);
    try {
      this.auth.loginDemo();
      await this.mostrarToast('Has ingresado en Modo Demostración.', 'medium');
      await this.router.navigate(['/tabs/inicio'], { replaceUrl: true });
    } finally {
      this.cargando.set(false);
    }
  }

  async abrirRecuperacion(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Restablecer contraseña',
      message: 'Ingresa tu correo para enviarte el enlace de recuperación con Firebase Authentication:',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'tu.correo@ejemplo.com',
          value: this.form.get('email')?.value || '',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Enviar enlace',
          handler: async (data) => {
            const correo = data.email?.trim();
            if (!correo || !correo.includes('@')) {
              await this.mostrarToast('Por favor escribe un correo electrónico válido.', 'warning');
              return false;
            }
            try {
              await this.auth.resetPassword(correo);
              await this.mostrarToast('Correo de recuperación enviado. Revisa tu bandeja de entrada.', 'success');
            } catch (err) {
              const msg = this.auth.formatFirebaseError(err);
              await this.mostrarToast(msg, 'danger');
            }
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  private async mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning' | 'medium'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3200,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}
