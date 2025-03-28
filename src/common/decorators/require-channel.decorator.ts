import { SetMetadata } from '@nestjs/common';

// Define a constant for the metadata key
export const REQUIRE_CHANNEL_KEY = 'requireChannel';

// Fixed decorator implementation
export const RequireChannel = () => SetMetadata(REQUIRE_CHANNEL_KEY, true);
