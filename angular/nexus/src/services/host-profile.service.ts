import { Injectable, inject, signal } from '@angular/core';
import { HostProfile } from '../models/host-profile.model.js';
import { DbService } from './db.service.js';

@Injectable({
    providedIn: 'root'
})
export class HostProfileService {
    private dbService = inject(DbService);

    readonly profiles = signal<HostProfile[]>([{
        id: 'default-local-host',
        name: 'Local Host',
        hostServerUrl: 'http://localhost:8085',
        imageUrl: '',
        description: 'Default local host server'
    }]);

    constructor() {
        this.loadProfiles();
    }

    async loadProfiles(): Promise<void> {
        const profiles = await this.dbService.getAllHostProfiles();
        // If DB has profiles, use them. Otherwise keep the default.
        if (profiles.length > 0) {
            this.profiles.set(profiles);
            console.log('[HostProfileService] Loaded profiles from DB', profiles);
        } else {
            console.log('[HostProfileService] Using default profile');
        }
    }

    async saveProfile(profile: HostProfile): Promise<void> {
        const existing = this.profiles().find(p => p.id === profile.id);
        if (existing) {
            await this.dbService.updateHostProfile(profile);
            this.profiles.update(current =>
                current.map(p => p.id === profile.id ? profile : p)
            );
        } else {
            await this.dbService.addHostProfile(profile);
            this.profiles.update(current => [...current, profile]);
        }
    }

    async deleteProfile(profileId: string): Promise<void> {
        await this.dbService.deleteHostProfile(profileId);
        this.profiles.update(current => current.filter(p => p.id !== profileId));
    }
}
