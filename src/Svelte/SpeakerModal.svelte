<script>
  import { createEventDispatcher } from 'svelte';
  import simplur from 'simplur';
  import { formatAgendaDateTime } from '../loaders/agendaData';

  export let open = false;
  export let loading = false;
  export let error = '';
  export let speaker = null;

  export let bg_color = 'bg-white';
  export let border_color = 'border-black';
  export let text_color = 'text-black';
  export let sub_color = 'text-black';
  export let category_color = 'text-black';
  export let speaker_border = 'border-black';

  const dispatch = createEventDispatcher();

  // Move node to document.body so `fixed` is relative to the viewport,
  // not a transformed/overflow-clipped ancestor in the host page.
  function portal(node) {
    document.body.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      }
    };
  }

  function close() {
    dispatch('close');
  }

  function selectSpeaker(sp) {
    const hid = sp.id ?? sp.hid ?? sp.speaker_hid ?? sp.slug ?? sp.uuid;
    if (hid != null) {
      dispatch('select', hid);
    } else {
      console.warn('SpeakerModal: agenda speaker has no id/hid field.', sp);
    }
  }

  function onBackdropClick(event) {
    if (event.target === event.currentTarget) {
      close();
    }
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      close();
    }
  }

  $: bio = speaker && (speaker.bio ?? speaker.about);
  $: agendas = Array.isArray(speaker?.agendas) ? speaker.agendas : [];

  // speakers is grouped { category: [...] } — keep the grouping.
  function speakerGroups(speakers) {
    if (!speakers || typeof speakers !== 'object') return [];
    return Object.entries(speakers).filter(([, list]) => Array.isArray(list) && list.length);
  }
</script>

<svelte:window on:keydown={onKeydown} />

{#if open}
  <div
    use:portal
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
    on:click={onBackdropClick}
    role="presentation"
  >
    <div
      class="relative max-h-[85vh] w-full overflow-y-auto rounded-2xl border p-6 {bg_color} {agendas.length ? 'max-w-5xl' : 'max-w-md'}"
      role="dialog"
      aria-modal="true"
      aria-label="Speaker details"
    >
      <button
        type="button"
        class="absolute right-4 top-4 cursor-pointer border-0 bg-transparent p-0 text-xl leading-none {sub_color}"
        aria-label="Close"
        on:click={close}
      >&times;</button>

      {#if loading}
        <div class="agenda-loader">
          <div class="agenda-loader__spinner" aria-label="Loading speaker" role="status"></div>
        </div>
      {:else if error}
        <div class="py-6 text-sm text-red-600">{error}</div>
      {:else if speaker}
        <div class="grid {agendas.length ? 'md:grid-cols-3' : ''} gap-6">
          <div class="flex flex-col items-center gap-2 text-center">
            {#if speaker.photo}
              <div class="h-28 w-28 flex-shrink-0 overflow-hidden rounded-full border-solid border-r-4 border-b-4 shadow-[0_15px_25px_rgba(15,23,42,0.12)] {speaker_border}">
                <img src={speaker.photo} alt={speaker.name} loading="lazy" class="h-full w-full object-cover" />
              </div>
            {/if}

            {#if speaker.name}
              <div class="text-lg font-bold {text_color}">{speaker.name}</div>
            {/if}
            {#if speaker.designation}
              <div class="text-xs {sub_color}">{speaker.designation}</div>
            {/if}
            {#if speaker.organisation}
              <div class="text-xs {sub_color}">{speaker.organisation}</div>
            {/if}

            {#if bio && !agendas.length}
              <div class="mt-2 w-full text-left">
                <div class="mb-1 font-bold uppercase tracking-[0.18em] text-xs {category_color}">About</div>
                <p class="text-sm {text_color}">{bio}</p>
              </div>
            {/if}

            {#if speaker.linkedin}
              <a
                class="mt-2 inline-flex justify-center text-sm font-semibold no-underline {category_color}"
                href={speaker.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${speaker.name} LinkedIn profile`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-brand-linkedin"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M17 2a5 5 0 0 1 5 5v10a5 5 0 0 1 -5 5h-10a5 5 0 0 1 -5 -5v-10a5 5 0 0 1 5 -5zm-9 8a1 1 0 0 0 -1 1v5a1 1 0 0 0 2 0v-5a1 1 0 0 0 -1 -1m6 0a3 3 0 0 0 -1.168 .236l-.125 .057a1 1 0 0 0 -1.707 .707v5a1 1 0 0 0 2 0v-3a1 1 0 0 1 2 0v3a1 1 0 0 0 2 0v-3a3 3 0 0 0 -3 -3m-6 -3a1 1 0 0 0 -.993 .883l-.007 .127a1 1 0 0 0 1.993 .117l.007 -.127a1 1 0 0 0 -1 -1" /></svg>
              </a>
            {/if}
          </div>

          {#if agendas.length}
            <div class="md:col-span-2 border-0 md:border-l border-solid md:pl-6 {border_color}">
              {#if bio}
                <div class="mb-6">
                  <div class="mb-1 font-bold uppercase tracking-[0.18em] text-xs {category_color}">About</div>
                  <p class="text-sm {text_color}">{bio}</p>
                </div>
              {/if}

              <div class="font-bold uppercase tracking-[0.18em] text-sm {category_color} mb-4">Sessions</div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {#each agendas as { name, category, start_time, venue, speakers }}
                  <div class="rounded-xl border border-solid p-3 {border_color}">
                    {#if start_time}
                      <div class="text-xs {sub_color}">{formatAgendaDateTime(start_time)} IST</div>
                    {/if}
                    {#if category}
                      <div class="{category_color} uppercase text-xs">{category}</div>
                    {/if}
                    {#if name}
                      <div class="font-bold {text_color}">{name}</div>
                    {/if}
                    {#if venue}
                      <div class="text-xs {sub_color}">{venue}</div>
                    {/if}

                    {#each speakerGroups(speakers) as [group, list]}
                      <div class="mt-3">
                        <div class="mb-1 text-[0.65rem] font-bold uppercase tracking-wide {sub_color}">{simplur`${[list.length, group]}[|s]`}</div>
                        <div class="flex flex-col gap-2">
                          {#each list as sp}
                            <button
                              type="button"
                              class="flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left"
                              aria-haspopup="dialog"
                              on:click={() => selectSpeaker(sp)}
                            >
                              {#if sp.photo}
                                <div class="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-solid {speaker_border}">
                                  <img src={sp.photo} alt={sp.name} loading="lazy" class="h-full w-full object-cover" />
                                </div>
                              {/if}
                              <div class="text-left">
                                <div class="text-xs font-semibold {text_color}">{sp.name}</div>
                                {#if sp.designation ?? sp.organisation}
                                  <div class="text-[0.65rem] {sub_color}">{[sp.designation, sp.organisation].filter(Boolean).join(', ')}</div>
                                {/if}
                              </div>
                            </button>
                          {/each}
                        </div>
                      </div>
                    {/each}
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
