import { defineStore } from "pinia";
import { useRuntimeConfig } from "#app";
import { computed, ref } from "vue";
import { useSession } from "~/composables/useSession";
import { useStrainRecommendation } from '~/composables/useStrainRecommendation'

export const useStrainStore = defineStore("strains", () => {
  const config = useRuntimeConfig();
  const allStrains = ref([]);
  const pending = ref(false);
  const error = ref(null);

  const brandOptions = computed(() => {
    const map = new Map<
      string,
      { id: string; name: string; rank: number | null; userRank: number | null }
    >();
    for (const strain of allStrains.value) {
      const b = strain.brand;
      if (b?.id && b.name) {
        if (!map.has(b.id)) {
          map.set(b.id, {
            id: b.id,
            name: b.name,
            rank: b.rank ?? null,
            userRank: b.userRank ?? null, // new property here
          });
        }
      }
    }
    return Array.from(map.values());
  });

  const { session } = useSession();

  const userFavoriteBrands = computed(() => {
    if (!session.value?.preferences?.length) return [];

    const seen = new Set<string>();
    const result: { id: string; name: string }[] = [];

    for (const pref of session.value.preferences) {
      const brand = pref.strain?.brand;
      if (pref.liked && brand?.id && brand.name && !seen.has(brand.id)) {
        seen.add(brand.id);
        result.push({ id: brand.id, name: brand.name });
      }
    }

    return result;
  });

//default sort
// liked strains, 
// favorite user brands,
// favorite admin brands
watchEffect(() => {
  if (!session.value || !allStrains.value.length) return

  console.log('✅ Session is available in store:', session.value)
  console.log('Favorite brands:', userFavoriteBrands.value)

  const likedStrainIds = new Set(
    session.value.preferences
      ?.filter(p => p.liked && p.strainId)
      .map(p => p.strainId)
  )

  const favoriteBrandIds = new Set(userFavoriteBrands.value.map(b => b.id))

  allStrains.value.sort((a, b) => {
    // 1. User liked strain
    const aLiked = likedStrainIds.has(a.id) ? 1 : 0
    const bLiked = likedStrainIds.has(b.id) ? 1 : 0
    if (aLiked !== bLiked) return bLiked - aLiked

    // 2. User liked brand
    const aFavBrand = a.brand?.id && favoriteBrandIds.has(a.brand.id) ? 1 : 0
    const bFavBrand = b.brand?.id && favoriteBrandIds.has(b.brand.id) ? 1 : 0
    if (aFavBrand !== bFavBrand) return bFavBrand - aFavBrand

    // 3. Admin-ranked brands (lower rank = higher priority)
    const aRank = a.brand?.rank ?? Infinity
    const bRank = b.brand?.rank ?? Infinity
    if (aRank !== bRank) return aRank - bRank

    // 4. Keep original order if no other priorities
    return 0
  })
})




  const terpeneOptions = computed(() => {
    const seen = new Set<string>();
    return allStrains.value
      .flatMap((strain) => strain.terpenes || [])
      .map((st) => st.terpene?.name || st.name)
      .filter(
        (name): name is string => !!name && !seen.has(name) && seen.add(name)
      );
  });

  const storeOptions = computed(() => {
    const seen = new Set<string>();
    return allStrains.value
      .map((strain) => strain.store?.name)
      .filter(
        (storeName): storeName is string =>
          !!storeName && !seen.has(storeName) && seen.add(storeName)
      );
  });

  const fetchStrains = async () => {
    if (allStrains.value.length) return;
    try {
      pending.value = true;
      const result = await $fetch(
        `${config.public.serverUrl}/strains/get-strains`
      );
      allStrains.value = result;
      console.log("Fetched allStrains:", allStrains.value);
    } catch (err) {
      error.value = err;
    } finally {
      pending.value = false;
    }
  };




const userStrainFavorites = ref([]) // Array of { strain, recommendations }

watchEffect(async () => {
  if (!session.value?.preferences?.length || !allStrains.value.length) return

  const { fetchStrainRecommendation } = useStrainRecommendation()

  const likedPrefs = session.value.preferences.filter(p => p.liked && p.strainId)
  const alreadyFetched = new Set(userStrainFavorites.value.map(entry => entry.strain.id))

  for (const pref of likedPrefs) {
    const strain = allStrains.value.find(s => s.id === pref.strainId)
    if (strain && !alreadyFetched.has(strain.id)) {
      

      const params = {
        strainId: strain.id,        
      }

      console.log('📨 Calling fetchStrainRecommendation with params:', params)

      const recs = await fetchStrainRecommendation(params)

      console.log("🔍 Fetched recommendations for strain:", strain.name, recs)

      userStrainFavorites.value.push({ strain, recommendations: recs })
    }
  }
})




  return {
    allStrains,
    pending,
    error,
    fetchStrains,
    brandOptions,
    storeOptions,
    terpeneOptions,
    userFavoriteBrands,
    userStrainFavorites
  };
});
