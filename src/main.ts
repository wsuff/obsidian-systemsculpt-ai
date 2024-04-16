import { Plugin, TAbstractFile, TFile } from 'obsidian';
import {
  SystemSculptSettings,
  DEFAULT_SETTINGS,
  SystemSculptSettingTab,
} from './settings';
import { TasksModule } from './modules/tasks/TasksModule';
import { BrainModule } from './modules/brain/BrainModule';
import { TemplatesModule } from './modules/templates/TemplatesModule';
import { DataModule } from './modules/data/DataModule';
import { RecorderModule } from './modules/recorder/RecorderModule';
import { AboutModule } from './modules/about/AboutModule';
import { OpenAIService } from './api/OpenAIService';
import { UpdateModule } from './modules/update/UpdateModule';
import { registerMp3ContextMenu } from './events';
import { setupUpdateStatusBar } from './modules/update/updateInStatusBar';

const development = true;

if (!development) {
  console.log = function () {}; // Disable console.log in non-development environments
}
export default class SystemSculptPlugin extends Plugin {
  settings: SystemSculptSettings;
  tasksModule: TasksModule;
  brainModule: BrainModule;
  templatesModule: TemplatesModule;
  dataModule: DataModule;
  recorderModule: RecorderModule;
  aboutModule: AboutModule;
  updateModule: UpdateModule;
  modelToggleStatusBarItem: HTMLElement | null = null;
  maxTokensToggleStatusBarItem: HTMLElement | null = null;
  taskToggleStatusBarItem: HTMLElement | null = null; // Add this line
  recorderToggleStatusBarItem: HTMLElement | null = null; // Add this line
  updateStatusBarItem: HTMLElement | null = null; // Add this line

  async onload() {
    await this.loadSettings();

    // Initialize modules with dependencies
    this.brainModule = this.initializeBrainModule();
    await this.brainModule.load();

    this.tasksModule = this.initializeTasksModule(this.brainModule);
    this.tasksModule.load();

    this.templatesModule = new TemplatesModule(this);
    this.templatesModule.load();

    this.dataModule = new DataModule(this);
    this.dataModule.load();

    const openAIService = OpenAIService.getInstance(
      this.settings.openAIApiKey,
      this.settings
    );
    this.recorderModule = new RecorderModule(this, openAIService);
    this.recorderModule.load();

    this.aboutModule = new AboutModule(this);
    this.aboutModule.load();

    this.updateModule = new UpdateModule(this);
    this.updateModule.load();

    this.addSettingTab(new SystemSculptSettingTab(this.app, this));

    // Register the context menu item for .mp3 files using the new events module
    registerMp3ContextMenu(this, this.recorderModule);

    this.updateStatusBarItem = setupUpdateStatusBar(this, this.updateModule);
  }

  private initializeBrainModule(): BrainModule {
    const openAIService = OpenAIService.getInstance(
      this.settings.openAIApiKey,
      this.settings
    );
    return new BrainModule(this, openAIService);
  }

  private initializeTasksModule(brainModule: BrainModule): TasksModule {
    return new TasksModule(this, brainModule);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
