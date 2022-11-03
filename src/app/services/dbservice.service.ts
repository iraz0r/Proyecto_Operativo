import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Platform, ToastController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Noticias } from './noticias';

@Injectable({
  providedIn: 'root'
})
export class DbserviceService {

  db: SQLiteObject = null;

  public database: SQLiteObject;

  tablaNoticias: string = "CREATE TABLE IF NOT EXISTS noticia(id INTEGER PRIMARY KEY autoincrement, titulo VARCHAR(50) NOT NULL, texto TEXT NOT NULL);";
  registro: string = "INSERT or IGNORE INTO noticia(id, titulo, texto) VALUES (1, 'Titulo noticia', 'Texto de la noticia que se quiere mostrar');";
  listaNoticias = new BehaviorSubject([]);

  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  
  constructor(private sqlite: SQLite, private platform: Platform, public toastController: ToastController) { this.crearBD(); }
  /**
   * Permite guardar un objeto SQLiteObject
   * en la variable db
   */
  setDatabase(db:SQLiteObject) {
    if(this.db===null)
    {
      this.db=db
    };
  }
  /**
   * Crea las tablas necesarias para el funcionamiento
   */
  createTables():Promise<any>{
    let tables=`
    CREATE TABLE IF NOT EXISTS sesion_data
    (
      user_name TEXT PRIMARY KEY NOT NULL,
      password INTEGER NOT NULL,
      active INTEGER(1) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS experiencia
    (
      id NUMBER PRIMARY KEY AUTOINCREMENT,
      empresa TEXT NOT NULL,
      anio_incio TEXT NOT NULL,
      trabajo_actual INTEGER(1) NOT NULL,
      anio_termino TEXT,
      cargo TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS certificacion
    (
      id NUMBER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      fecha_obtención TEXT NOT NULL,
      vencimiento INTEGER(1) NOT NULL,
      fecha_vencimiento TEXT
    );`;
    return this.db.executeSql(tables);
  }
  /**
   * Retorna si existe un usuario activo o no.
   */
  sesionActive(){
    // Se desarrolla la consulta
    let sql = `SELECT user_name,active FROM sesion_data WHERE active=1 LIMIT 1`;
    // Se ejecuta la consulta y no le pasamos parametros [value,value1,...]
    return this.db.executeSql(sql,[])
    // Cuando se ejecute la consulta
    .then(response=>{ // obtenemos lo que devuelve la consulta
      return Promise.resolve(response.rows.item(0)); // Se obtiene el primer item de la consulta y se retorna
    });
  }
  /**
   * Función que valida la existencia del usuario que esta iniciando sesión
   * @param sesion Datos de inicio de sesión Usuario y Password
   */
  getSesionData(sesion:any){
    let sql = `SELECT user_name, active FROM sesion_data
    WHERE user_name=? AND password=? LIMIT 1`;
    return this.db.executeSql(sql,[sesion.Usuario,
      sesion.Password]).then(response=>{
        return Promise.resolve(response.rows.item(0));
      });
  }
  /**
   * Función que crea un nuevo registro de inicio de sesión
   * @param sesion Datos de inicio de sesión Usuario, Password y Active
   */
  createSesionData(sesion:any){
    let sql = `INSERT INTO sesion_data(user_name,password,active)
    VALUES(?,?,?)`;
    return this.db.executeSql(sql, [sesion.Usuario, 
      sesion.Password, sesion.Active]).then(response=>{
        return Promise.resolve(response.rows.item(0));
      });;
  }
  updateSesionData(sesion:any){
    let sql = `UPDATE sesion_data
    SET active=?
    WHERE user_name=?`;
    return this.db.executeSql(sql, [sesion.active,sesion.user_name]);
  }

  addNoticia(titulo,texto){
    let data=[titulo,texto];
    return this.database.executeSql('INSERT INTO noticia(titulo,texto) VALUES(?,?)',data)
    .then(res =>{
      this.buscarNoticias();
    })

  }

  updateNoticia(id, titulo, texto){
    let data = [titulo, texto, id];
    return this.database.executeSql('UPDATE noticia SET titulo = ?, texto = ? WHERE id = ?', data)
    .then(data2 =>{
      this.buscarNoticias();
    })

  }

  deleteNoticia(id){
    return this.database.executeSql('DELETE FROM noticia WHERE id = ?', [id])
    .then(a =>{
      this.buscarNoticias();
    })
  }

  dbState() {
    return this.isDbReady.asObservable();
  }

  crearBD() {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: 'noticias3.db',
        location: 'default'

      }).then((db: SQLiteObject) => {
        this.database = db;
        this.presentToast("BD Creada");
        //llamamos a la creación de tablas
        this.crearTablas();
      }).catch(e => this.presentToast(e));
    })
  }

  async crearTablas() {
    try {
      await this.database.executeSql(this.tablaNoticias, []);
      await this.database.executeSql(this.registro, []);
      this.presentToast("Tabla Creada");
      this.buscarNoticias();
      this.isDbReady.next(true);
    } catch (e) {
      this.presentToast("error creartabla " + e);
    }
  }

  buscarNoticias() {
    //this.presentAlert("a");
    return this.database.executeSql('SELECT * FROM noticia', []).then(res => {
      let items: Noticias[] = [];
      //this.presentAlert("b");
      if (res.rows.length > 0) {
        //this.presentAlert("c");
        for (var i = 0; i < res.rows.length; i++) {
          //this.presentAlert("d");
          items.push({
            id: res.rows.item(i).id,
            titulo: res.rows.item(i).titulo,
            texto: res.rows.item(i).texto
          });
        }
      }
      //this.presentAlert("d");
      this.listaNoticias.next(items);
    });
  }

  fetchNoticias(): Observable<Noticias[]> {
  return this.listaNoticias.asObservable();
  }

  async presentToast(mensaje: string) {
  const toast = await this.toastController.create({
    message: mensaje,
    duration: 3000
  });
  toast.present();
  }
 
}
