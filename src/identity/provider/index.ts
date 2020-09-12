
import { Identity } from '../'
import { WebauthnIdentityProvider } from './webauthn'
import { MetamaskIdentityProvider } from './metamask'

/**
 * The immutable registry of all identity providers
 */
export const PROVIDERS: IdentityProvider[] = [
  // default identity providers
  MetamaskIdentityProvider,
  WebauthnIdentityProvider,
]

interface BaseInput {
  /** description or display name of the input parameter */
  description: string;
  default?: string;
  disabled?: boolean;
}

/**
 * Using the `<select>` element
 */
interface SelectInput extends BaseInput {
  type: 'select';
  options: ReadonlyArray<string>;
}

/**
 * Using the `<input type="text">` element
 */
interface TextInput extends BaseInput {
  type: 'text';
  placeholder?: string;
  required?: boolean;
}

type InputConfig = SelectInput | TextInput

export interface IdentityProvider<InputFields extends string = any> {
  type: string;
  displayName: string;

  /**
   * The url to the logo image of the provider
   */
  logo: string;

  /**
   * The summary of the provider shown on the Authentication Method list
   */
  summary?: string;

  /**
   * The long description of the provider
   */
  description?: string;

  available?: () => boolean;

  /**
   * Specify additional data fields (e.g. version, text input) that the provider expects to use
   */
  inputs: Record<InputFields /** name */, InputConfig>;

  /**
   * @returns If at least one `Identity` available
   */
  requestIdentities (inputs: Record<InputFields /** name */, string /** value */>): Promise<Identity[]>;

  /**
   * Open the `createIdentity` modal or popup
   */
  createIdentity?: (inputs: Record<InputFields, string>) => Promise<void>;
}

export const isProviderAvailable = (provider: IdentityProvider): boolean => {
  return typeof provider.available === 'function'
    ? provider.available()
    : true
}

/**
 * List identity providers in the registry (immutable)
 */
export const listProviders = (onlyAvailable = true): IdentityProvider[] => {
  let providers = PROVIDERS.concat() // array copy
  if (onlyAvailable) {
    // filter out unavailable providers
    providers = providers.filter((p) => isProviderAvailable(p))
  }
  return providers
}

/**
 * Register identity provider(s)
 * @param providers 
 * @returns all identity providers in the registry
 */
export const registerProviders = (...providers: IdentityProvider[]): IdentityProvider[] => {
  PROVIDERS.push(...providers)
  return listProviders(false)
}
