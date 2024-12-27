<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

class HimnarioManager {
    private $archivo = 'letras.json';
    private $backupDir = 'backups/';

    public function __construct() {
        // Crear directorio de backups si no existe
        if (!file_exists($this->backupDir)) {
            mkdir($this->backupDir, 0777, true);
        }
    }

    // Crear backup del archivo
    private function crearBackup() {
        if (file_exists($this->archivo)) {
            $backupFile = $this->backupDir . 'backup_' . date('Y-m-d_H-i-s') . '_letras.json';
            return copy($this->archivo, $backupFile);
        }
        return true;
    }

    // Validar estructura del JSON
    private function validarEstructura($data) {
        if (!isset($data->himnos) || !is_array($data->himnos)) {
            throw new Exception('Estructura JSON inválida: falta el array de himnos');
        }

        foreach ($data->himnos as $himno) {
            if (!isset($himno->numero) || !isset($himno->titulo_quechua) || !isset($himno->letra)) {
                throw new Exception('Estructura de himno inválida: faltan campos requeridos');
            }
            if (!isset($himno->letra->quechua) || !isset($himno->letra->castellano)) {
                throw new Exception('Estructura de letra inválida: faltan idiomas requeridos');
            }
        }
        return true;
    }

    // Guardar cambios
    public function guardarCambios($jsonData) {
        try {
            // Verificar que el JSON es válido
            $data = json_decode($jsonData);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('JSON inválido: ' . json_last_error_msg());
            }

            // Validar estructura
            $this->validarEstructura($data);

            // Verificar permisos de escritura
            if (file_exists($this->archivo) && !is_writable($this->archivo)) {
                throw new Exception('No hay permisos de escritura en el archivo');
            }

            // Crear backup antes de modificar
            if (!$this->crearBackup()) {
                throw new Exception('No se pudo crear el backup');
            }

            // Guardar los cambios
            if (file_put_contents($this->archivo, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
                throw new Exception('Error al escribir el archivo');
            }

            return [
                'success' => true,
                'message' => 'Archivo guardado correctamente',
                'timestamp' => date('Y-m-d H:i:s')
            ];

        } catch (Exception $e) {
            http_response_code(500);
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'timestamp' => date('Y-m-d H:i:s')
            ];
        }
    }
}

try {
    // Verificar que sea una petición POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // Obtener el contenido JSON enviado
    $jsonData = file_get_contents('php://input');
    if ($jsonData === false) {
        throw new Exception('Error al leer los datos enviados');
    }

    // Procesar los cambios
    $manager = new HimnarioManager();
    $resultado = $manager->guardarCambios($jsonData);

    // Enviar respuesta
    echo json_encode($resultado);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?> 