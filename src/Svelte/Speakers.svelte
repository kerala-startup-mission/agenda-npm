<script>
  import { onMount } from 'svelte';
  import { loadSpeakersData } from '../loaders/speakersData';

  export let event;
  export let url;
  export let categories_filter = '';
  export let columns = 0;
  export let border_color;
  export let text_color;
  export let bg_color;
  export let speaker_border;
  export let category_color;
  export let sub_color;

  let loading = true;
  let load_error = "";
  let speaker_entries = [];
  $: grid_style = columns > 0 ? `grid-template-columns: repeat(${columns}, minmax(0, 1fr));` : null;

  async function loadData() {
    loading = true;
    load_error = "";

    try {
      const data = await loadSpeakersData({ url, event, categories: categories_filter });
      speaker_entries = data.speakers;
    } catch (error) {
      console.error('Speakers embed failed to load data.', error);
      load_error = 'Unable to load the speakers right now.';
      speaker_entries = [];
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    await loadData();
  });
</script>

{#if loading}
  <div class="agenda-loader">
    <div class="agenda-loader__spinner" aria-label="Loading speakers" role="status"></div>
  </div>
{:else if load_error}
  <div class="py-6 text-sm text-red-600">{load_error}</div>
{:else if !speaker_entries.length}
  <div class="py-6 text-sm {text_color}">No speakers are available.</div>
{:else}
  <div class="space-y-10">
    {#each speaker_entries as [category, speakers]}
      <section class="speakers-group">
        <div class="font-bold uppercase tracking-[0.18em] text-sm {category_color} mb-5">
          {category}
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" style={grid_style}>
          {#each speakers as { name, designation, organisation, photo, linkedin, id }}
            <article class="flex min-h-full flex-col gap-4 rounded-2xl border p-5 {bg_color} {border_color}">
              <div class="flex justify-center">
                <div class="h-28 w-28 flex-shrink-0 overflow-hidden rounded-full border-r-4 border-b-4 shadow-[0_15px_25px_rgba(15,23,42,0.12)] {speaker_border}">
                  <img src={photo} alt={name} loading="lazy" class="h-full w-full object-cover" />
                </div>
              </div>

              <div class="flex flex-col gap-[0.35rem] text-center">
                <h3 class="font-bold {text_color}">{name}</h3>
                <div class="text-xs {sub_color}">{designation ?? ''}</div>
                <div class="text-xs {sub_color}">{organisation ?? ''}</div>

                {#if linkedin}
                  <a
                    class="mt-3 inline-flex justify-center text-sm font-semibold no-underline {category_color}"
                    href={linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${name} LinkedIn profile`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-brand-linkedin"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M17 2a5 5 0 0 1 5 5v10a5 5 0 0 1 -5 5h-10a5 5 0 0 1 -5 -5v-10a5 5 0 0 1 5 -5zm-9 8a1 1 0 0 0 -1 1v5a1 1 0 0 0 2 0v-5a1 1 0 0 0 -1 -1m6 0a3 3 0 0 0 -1.168 .236l-.125 .057a1 1 0 0 0 -1.707 .707v5a1 1 0 0 0 2 0v-3a1 1 0 0 1 2 0v3a1 1 0 0 0 2 0v-3a3 3 0 0 0 -3 -3m-6 -3a1 1 0 0 0 -.993 .883l-.007 .127a1 1 0 0 0 1.993 .117l.007 -.127a1 1 0 0 0 -1 -1" /></svg>
                  </a>
                {/if}
              </div>
            </article>
          {/each}
        </div>
      </section>
    {/each}
  </div>
{/if}
