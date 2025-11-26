import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { JahaApiService } from '../services/jaha-api.service';
import { SetRouteRequestDto } from '../dto/set-route-request.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly jahaApiService: JahaApiService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Health check endpoint para Docker y monitoreo
   */
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * Endpoint para obtener el estado de las líneas desde la API de Jaha
   */
  @Get('linea/status')
  async getLineaStatus() {
    return await this.jahaApiService.getLineaStatus();
  }

  /**
   * Endpoint para obtener y guardar el estado de las líneas en la base de datos
   */
  @Get('linea/fetch-and-save')
  async fetchAndSaveLineaStatus() {
    return await this.jahaApiService.fetchAndSaveLineaStatus();
  }

  /**
   * Endpoint para obtener todos los registros de línea desde la base de datos
   */
  @Get('linea/db/all')
  async getAllLineaStatusFromDB() {
    return await this.jahaApiService.getAllLineaStatusFromDB();
  }

  /**
   * Endpoint para obtener el estado de una unidad específica desde la base de datos
   */
  @Get('linea/db/unidad/:unidad')
  async getLineaStatusByUnidad(@Param('unidad') unidad: string) {
    return await this.jahaApiService.getLineaStatusByUnidad(parseInt(unidad));
  }

  /**
   * Endpoint para obtener el estado de una unidad específica desde la API de Jaha
   */
  @Get('unidad/status/:unidadId/:lineaId/:empresaId')
  async getUnidadStatus(
    @Param('unidadId') unidadId: string,
    @Param('lineaId') lineaId: string,
    @Param('empresaId') empresaId: string,
  ) {
    return await this.jahaApiService.getUnidadStatus(
      parseInt(unidadId),
      parseInt(lineaId),
      parseInt(empresaId),
    );
  }

  /**
   * Endpoint para obtener y guardar el estado de una unidad específica en la base de datos
   */
  @Get('unidad/fetch-and-save/:unidadId/:lineaId/:empresaId')
  async fetchAndSaveUnidadStatus(
    @Param('unidadId') unidadId: string,
    @Param('lineaId') lineaId: string,
    @Param('empresaId') empresaId: string,
  ) {
    return await this.jahaApiService.fetchAndSaveUnidadStatus(
      parseInt(unidadId),
      parseInt(lineaId),
      parseInt(empresaId),
    );
  }

  /**
   * Endpoint para obtener las rutas disponibles de una línea específica desde la API
   */
  @Get('route/:lineaId/routes')
  async getRoutesByLinea(@Param('lineaId') lineaId: string) {
    return await this.jahaApiService.getRoutesByLinea(parseInt(lineaId));
  }

  /**
   * Endpoint para obtener y guardar/actualizar las rutas de una línea en la base de datos
   */
  @Get('route/:lineaId/fetch-and-save')
  async fetchAndSaveRoutes(@Param('lineaId') lineaId: string) {
    return await this.jahaApiService.fetchAndSaveRoutes(parseInt(lineaId));
  }

  /**
   * Endpoint para obtener todas las rutas desde la base de datos
   */
  @Get('route/db/all')
  async getAllRoutesFromDB() {
    return await this.jahaApiService.getAllRoutesFromDB();
  }

  /**
   * Endpoint para obtener las rutas de una línea específica desde la base de datos
   */
  @Get('route/db/linea/:lineaId')
  async getRoutesByLineaFromDB(@Param('lineaId') lineaId: string) {
    return await this.jahaApiService.getRoutesByLineaFromDB(parseInt(lineaId));
  }

  /**
   * Endpoint para obtener una ruta específica por ID desde la base de datos
   */
  @Get('route/db/:routeId')
  async getRouteByIdFromDB(@Param('routeId') routeId: string) {
    return await this.jahaApiService.getRouteByIdFromDB(parseInt(routeId));
  }

  /**
   * Endpoint para establecer una ruta a una unidad específica
   */
  @Post('route/setRoute')
  async setRoute(
    @Body() payload: SetRouteRequestDto
  ) {
    return await this.jahaApiService.setRoute(payload);
  }
}
