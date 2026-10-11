// PrimeVue ships these runtime-only modules without declarations, so under
// skipLibCheck: false its own index.d.ts fails on them (TS7016). A strict
// consumer declares them away — so do the strict smoke-types envs.
declare module 'primevue/confirmationeventbus'
declare module 'primevue/dynamicdialogeventbus'
declare module 'primevue/overlayeventbus'
declare module 'primevue/toasteventbus'
