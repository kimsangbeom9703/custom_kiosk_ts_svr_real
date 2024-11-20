import { app, BrowserWindow } from 'electron';
import { createWindow, registerShortcuts } from './Modules/App';  // createWindow와 registerShortcuts 모듈을 불러옵니다
import * as log from 'electron-log';  // 로깅을 위한 모듈
import * as json5 from 'json5';  // JSON5 형식 파싱을 위한 모듈
import * as path from 'path';  // 파일 경로를 처리하기 위한 모듈
import * as fs from 'fs';  // 파일 시스템을 처리하기 위한 모듈

//----------------------------------------------------------------------------------------------------------------------

// 설정 파일 경로
const configDataPath: string = path.join(__dirname, '../json/config.json5');
const configDataText: string = fs.readFileSync(configDataPath, { encoding: 'utf8', flag: 'r' });  // 설정 파일 읽기
const configDataJson = json5.parse(configDataText);  // JSON5 파일 파싱

// 키오스크 설정 정보
const kioskWidth: number = configDataJson.equipment_width;  // 키오스크 화면 가로 크기
const kioskHeight: number = configDataJson.equipment_height;  // 키오스크 화면 세로 크기
const serviceTitle: string = configDataJson.equipment_name;  // 서비스 제목
const appName: string = configDataJson.equipment_appName;  // 애플리케이션 이름
const appPath: string = app.getAppPath();  // 애플리케이션의 경로
const chkSingleLock: boolean = app.requestSingleInstanceLock();  // 단일 인스턴스 실행을 위한 락 확인
const logFolderPath: string = log.transports.file.getFile().path;  // 로그 파일 경로

//----------------------------------------------------------------------------------------------------------------------

// 로그 정보 출력
log.info('Electron App dir:', appPath);
log.info('Electron Log dir:', logFolderPath);
log.info('단일 프로그램만 실행합니다:', chkSingleLock);

// 이미 프로그램이 실행 중이면 종료
if (!chkSingleLock) {
    log.error(`${serviceTitle} 프로그램이 이미 실행중 입니다.`);
    app.quit();  // 프로그램 종료
} else {
    // 애플리케이션 초기화 함수
    const startApp = async () => {
        try {
            // 단축키 등록
            await registerShortcuts();

            // 창 생성 (동기적 처리)
            await createWindow(appPath, kioskWidth, kioskHeight);

            // 애플리케이션 정보 로그
            log.info(`App started with dimensions: ${kioskWidth}x${kioskHeight}`);
            log.info(`App Name: ${appName}`);
        } catch (err) {
            // 초기화 중 에러 발생 시 로그 출력하고 앱 종료
            log.error('Error during app initialization:', err);
            app.quit();
        }
    };

    // 애플리케이션 준비 완료 후 startApp 호출
    app.whenReady()
        .then(startApp)
        .catch((err) => {
            log.error('Error during app ready event:', err);
            app.quit();
        });

    // macOS에서는 앱이 활성화될 때 새로운 창을 띄움
    app.on('activate', async () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            // 열려있는 창이 없다면 새 창을 생성
            await createWindow(appPath, kioskWidth, kioskHeight);
        }
    });

    // 모든 창이 닫히면 (macOS 제외) 앱 종료
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();  // macOS는 창을 닫아도 앱이 종료되지 않으므로 해당 조건을 추가
        }
    });
}
